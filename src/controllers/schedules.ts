import { Request, Response } from 'express';
import * as Schedules from '../models/schedules';
import * as TypeEnums from '../models/jobTypes';
import * as Users from '../models/users';
import * as Spares from '../models/spares';
import * as LoggedTime from '../models/loggedTime';
import * as StatusEnums from '../models/statusTypes';
import * as Properties from '../models/properties';
import makeIdList from '../helpers/makeIdList';
import timeDetailsArray from '../helpers/jobs/timeDetailsArray';
import calcTotalLoggedTime from '../helpers/jobs/calcTotalLoggedTime';
import { NewSpares } from '../types/spares';
import { updateSparesForJob } from '../helpers/jobs/updateSparesForJob';

export async function getAllPMSchedules(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const schedules = await Schedules.getPMSchedules(propertyId);
        res.status(200).json(schedules);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getPMSchedule(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const id = parseInt(req.params.scheduleid);
        const scheduleDetails = await Schedules.getPMSchedules(propertyId, id);
        const schedulePMs = await Schedules.getPMs(id);
        res.status(200).json({ scheduleDetails, schedulePMs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getPMDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.scheduleid);
        const schedulePMDetails = await Schedules.getPMDetails(id);
        const usedSpares = await Spares.getUsedSpares('pm', id);
        const timeDetails = await LoggedTime.getLoggedTimeDetails('pm', id);
        if (timeDetails.length > 0) {
            const userIds = makeIdList(timeDetails, 'id');
            const users = await Users.getUsersByIds(userIds);
            const timeDetailsFull = timeDetailsArray(timeDetails, users);
            res.status(200).json({ schedulePMDetails, usedSpares, timeDetails: timeDetailsFull });
        } else {
            res.status(200).json({ schedulePMDetails, usedSpares });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }

}

export async function getAddSchedule(req: Request, res: Response) {
    try {
        const types = await TypeEnums.getAllJobTypes();
        res.status(200).json({ types });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditSchedule(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.scheduleid);
        const PMScheduleDetails = await Schedules.getPMScheduleForEdit(id);
        const types = await TypeEnums.getAllJobTypes();
        res.status(200).json({ PMScheduleDetails, types });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditPM(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.scheduleid);
        const propertyId = parseInt(req.params.propertyid);
        const statusOptions = await StatusEnums.getAllStatusTypes();
        const completableStatus = statusOptions.filter((item) => item.can_complete).map((item) => item.id);
        const PMDetails = await Schedules.getPMforEdit(id);
        const scheduleDates = await Schedules.getScheduleDates(id);
        const users = await Properties.getAssignedUsers(propertyId);
        const timeDetails = await LoggedTime.getLoggedTimeDetails('pm', id);
        const usedSpares = await Spares.getUsedSpares('pm', id);
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, PMDetails, users, usedSpares, completableStatus, scheduleDates, timeDetails });
        } else {
            res.status(200).json({ statusOptions, PMDetails, users, usedSpares, completableStatus, scheduleDates });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addPMSchedule(req: Request, res: Response) {
    try {
        const response = await Schedules.addPMSchedule(req.body);
        const dueDate = req.body.startNow === 'Yes' ? 'CAST(CURDATE() as datetime)' : req.body.scheduleStart;
        const PM = await Schedules.addPM(response.insertId, dueDate)
        if (PM.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function editPMSchedule(req: Request, res: Response) {
    try {
        const response = await Schedules.editPMSchedule(req.body);
        if (req.body.editStart) {
            await Schedules.editPMdueDate(req.body.id, req.body.scheduleStart);
        }
        if (response.affectedRows === 1) {
            res.status(200).json({ updated: true });
        } else {
            res.status(500).json({ updated: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ updated: false });
    }
}

export async function editPM(req: Request, res: Response) {
    try {
        req.body = JSON.parse(req.body.data);
        const totalTime = calcTotalLoggedTime(req.body.loggedTimeDetails);
        const response = await Schedules.editPM(req.body, req.body.complete, totalTime);
        const newSpares = <NewSpares[]>req.body.sparesUsed;
        if (newSpares.length > 0) {
            updateSparesForJob(req.body.id, req.body.propertyId, newSpares, 'pm');
        }
        if (req.body.loggedTimeDetails.length > 0) {
            LoggedTime.setTimeDetails(req.body.loggedTimeDetails, 'pm', req.body.id);
        }
        if (req.body.complete == 1) {
            const scheduleDates = await Schedules.getScheduleDates(req.body.id, true);
            const scheduleId = await Schedules.getScheduleId(req.body.id);
            Schedules.addPM(scheduleId, req.body.continueSchedule ? scheduleDates[0].current_schedule : scheduleDates[0].new_schedule)
        }
        if (response.affectedRows === 1) {
            res.status(200).json({ updated: true });
        } else {
            res.status(500).json({ updated: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ updated: false });
    }
}

export async function deletePMSchedule(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const response = await Schedules.deletePMSchedule(id);
        if (response.affectedRows === 1) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}