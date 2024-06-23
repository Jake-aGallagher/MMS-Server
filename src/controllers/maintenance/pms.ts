import { Request, Response } from 'express';
import * as PMs from '../../models/maintenance/pms';
import * as Users from '../../models/users';
import * as Spares from '../../models/spares';
import * as LoggedTime from '../../models/maintenance/loggedTime';
import * as StatusEnums from '../../models/maintenance/statusTypes';
import * as Facilities from '../../models/facilities';
import * as TypeEnums from '../../models/maintenance/taskTypes';
import makeIdList from '../../helpers/makeIdList';
import timeDetailsArray from '../../helpers/jobs/timeDetailsArray';
import calcTotalLoggedTime from '../../helpers/jobs/calcTotalLoggedTime';
import { NewSpares } from '../../types/spares';
import { updateSparesForJob } from '../../helpers/jobs/updateSparesForJob';
import { getCustomFieldData, updateFieldData } from '../../models/customFields';

// --------------- PMs ---------------

export async function getAllPMs(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const pms = await PMs.getPMs(req.clientId, facilityId);
        res.status(200).json({ pms });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAllPMSchedules(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const schedules = await PMs.getPMSchedules(req.clientId, facilityId);
        res.status(200).json(schedules);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getPMDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.pmid);
        const pm = await PMs.getPMDetails(req.clientId, id);
        const customFields = await getCustomFieldData(req.clientId, 'pm', id, pm[0].type_id);
        const usedSpares = await Spares.getUsedSpares(req.clientId, 'pm', id, 'used');
        const timeDetails = await LoggedTime.getLoggedTimeDetails(req.clientId, 'pm', id);
        if (timeDetails.length > 0) {
            const userIds = makeIdList(timeDetails, 'id');
            const users = await Users.getUsersByIds(req.clientId, userIds);
            const timeDetailsFull = timeDetailsArray(timeDetails, users);
            res.status(200).json({ pm, customFields, usedSpares, timeDetails: timeDetailsFull });
        } else {
            res.status(200).json({ pm, customFields, usedSpares });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditPM(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.scheduleid);
        const facilityId = parseInt(req.params.facilityid);
        const statusOptions = await StatusEnums.getAllStatusTypes(req.clientId);
        const completableStatus = statusOptions.filter((item) => item.can_complete).map((item) => item.id);
        const PMDetails = await PMs.getPMforEdit(req.clientId, id);
        const customFields = await getCustomFieldData(req.clientId, 'pm', id, PMDetails[0].type_id);
        const scheduleDates = await PMs.getScheduleDates(req.clientId, id);
        const users = await Facilities.getAssignedUsers(req.clientId, facilityId);
        const timeDetails = await LoggedTime.getLoggedTimeDetails(req.clientId, 'pm', id);
        const usedSpares = await Spares.getUsedSpares(req.clientId, 'pm', id, 'used');
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, PMDetails, customFields, users, usedSpares, completableStatus, scheduleDates, timeDetails });
        } else {
            res.status(200).json({ statusOptions, PMDetails, customFields, users, usedSpares, completableStatus, scheduleDates });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function editPM(req: Request, res: Response) {
    try {
        const totalTime = calcTotalLoggedTime(req.body.loggedTimeDetails);
        const response = await PMs.editPM(req.clientId, req.body, req.body.complete, totalTime);
        await updateFieldData(req.clientId, req.body.id, req.body.fieldData);
        const newSpares = <NewSpares[]>req.body.sparesUsed;
        if (newSpares.length > 0) {
            updateSparesForJob(req.clientId, req.body.id, req.body.facilityId, newSpares, 'pm', 'used');
        }
        if (req.body.loggedTimeDetails.length > 0) {
            LoggedTime.setTimeDetails(req.clientId, req.body.loggedTimeDetails, 'pm', req.body.id);
        }
        if (req.body.complete == 1) {
            const scheduleDates = await PMs.getScheduleDates(req.clientId, req.body.id, true);
            const scheduleId = await PMs.getScheduleId(req.clientId, req.body.id);
            PMs.addPM(
                req.clientId,
                scheduleId,
                req.body.continueSchedule === 'Yes' ? "'" + scheduleDates[0].current_schedule + "'" : "'" + scheduleDates[0].new_schedule + "'"
            );
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

// --------------- Schedules ---------------

export async function getPMSchedule(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const id = parseInt(req.params.scheduleid);
        const scheduleDetails = await PMs.getPMSchedules(req.clientId, facilityId, id);
        const schedulePMs = await PMs.getPMsBySchedule(req.clientId, id);
        res.status(200).json({ scheduleDetails, schedulePMs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAddSchedule(req: Request, res: Response) {
    try {
        const types = await TypeEnums.getAllJobTypes(req.clientId);
        res.status(200).json({ types });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditSchedule(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.scheduleid);
        const PMScheduleDetails = await PMs.getPMScheduleForEdit(req.clientId, id);
        const types = await TypeEnums.getAllJobTypes(req.clientId);
        res.status(200).json({ PMScheduleDetails, types });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addPMSchedule(req: Request, res: Response) {
    try {
        const response = await PMs.addPMSchedule(req.clientId, req.body);
        const dueDate = req.body.startNow === 'Yes' ? 'CAST(CURDATE() as datetime)' : req.body.scheduleStart;
        const PM = await PMs.addPM(req.clientId, response.insertId, dueDate);
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
        const response = await PMs.editPMSchedule(req.clientId, req.body);
        if (req.body.editStart) {
            await PMs.editPMdueDate(req.clientId, req.body.id, req.body.scheduleStart);
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
        const response = await PMs.deletePMSchedule(req.clientId, id);
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
