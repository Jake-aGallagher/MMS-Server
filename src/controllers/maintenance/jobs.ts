import { Request, Response } from 'express';
import * as Jobs from '../../models/maintenance/jobs';
import * as Facilities from '../../models/facilities';
import * as Users from '../../models/users';
import * as Spares from '../../models/spares';
import * as TypeEnums from '../../models/maintenance/taskTypes';
import * as StatusEnums from '../../models/maintenance/statusTypes';
import * as UrgencyEnums from '../../models/maintenance/urgencyTypes';
import * as LoggedTime from '../../models/maintenance/loggedTime';
import * as Downtime from '../../models/maintenance/downtime';
import makeIdList from '../../helpers/makeIdList';
import timeDetailsArray from '../../helpers/jobs/timeDetailsArray';
import { updateSparesForJob } from '../../helpers/jobs/updateSparesForJob';
import { NewSpares } from '../../types/spares';
import calcTotalLoggedTime from '../../helpers/jobs/calcTotalLoggedTime';
import { getFileIds } from '../../helpers/files/getFileIds';
import { getCustomFieldData, updateFieldData } from '../../models/customFields';

export async function getAllJobs(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const allJobs = await Jobs.getAllJobs(req.clientId, facilityId);
        res.status(200).json(allJobs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const jobDetails = await Jobs.getJobDetails(req.clientId, id);
        const customFields = await getCustomFieldData(req.clientId, 'job', id, jobDetails[0].type_id);
        const files = await getFileIds(req.clientId, 'job', id);
        const usedSpares = await Spares.getUsedSpares(req.clientId, 'job', id, 'used');
        const missingSpares = await Spares.getUsedSpares(req.clientId, 'job', id, 'missing');
        const timeDetails = await LoggedTime.getLoggedTimeDetails(req.clientId, 'job', id);
        const downtime = await Downtime.getDowntimeDetails(req.clientId, 'job', id);
        if (timeDetails.length > 0) {
            const userIds = makeIdList(timeDetails, 'id');
            const users = await Users.getUsersByIds(req.clientId, userIds);
            const timeDetailsFull = timeDetailsArray(timeDetails, users);
            res.status(200).json({ jobDetails, customFields, files, timeDetails: timeDetailsFull, usedSpares, missingSpares, downtime });
        } else {
            res.status(200).json({ jobDetails, customFields, files, usedSpares, missingSpares, downtime });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumsForCreateJob(req: Request, res: Response) {
    try {
        const urgency = await UrgencyEnums.getAllUrgencyTypes(req.clientId);
        const types = await TypeEnums.getAllJobTypes(req.clientId);
        res.status(200).json({ types, urgency });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobUpdate(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const facilityId = parseInt(req.params.facilityid);
        const statusOptions = await StatusEnums.getAllStatusTypes(req.clientId);
        const completableStatus = statusOptions.filter((item) => item.can_complete).map((item) => item.id);
        const jobDetails = await Jobs.getJobDetails(req.clientId, id);
        const customFields = await getCustomFieldData(req.clientId, 'job', id, jobDetails[0].type_id);
        const users = await Facilities.getAssignedUsers(req.clientId, facilityId);
        const timeDetails = await LoggedTime.getLoggedTimeDetails(req.clientId, 'job', id);
        const usedSpares = await Spares.getUsedSpares(req.clientId, 'job', id, 'used');
        const missingSpares = await Spares.getUsedSpares(req.clientId, 'job', id, 'missing');
        const downtime = await Downtime.getDowntimeDetails(req.clientId, 'job', id);
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, jobDetails, customFields, users, usedSpares, missingSpares, downtime, completableStatus, timeDetails });
        } else {
            res.status(200).json({ statusOptions, jobDetails, customFields, users, usedSpares, missingSpares, downtime, completableStatus });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postJob(req: Request, res: Response) {
    try {
        const urgencyReq = req.body.urgency;
        const urgency = await UrgencyEnums.getUrgencyPayload(req.clientId, urgencyReq);
        const response = await Jobs.postJob(req.clientId, req.body, urgency);
        await updateFieldData(req.clientId, response.insertId, req.body.fieldData);
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true, jobId: response.insertId });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function updateAndComplete(req: Request, res: Response) {
    try {
        const jobId = parseInt(req.body.id);
        const facilityId = parseInt(req.body.facilityId);
        const totalTime = calcTotalLoggedTime(req.body.logged_time_details);
        const response = await Jobs.updateAndComplete(req.clientId, req.body, totalTime);
        await updateFieldData(req.clientId, req.body.id, req.body.fieldData);
        const newSpares = <NewSpares[]>req.body.sparesUsed;
        if (newSpares.length > 0) {
            updateSparesForJob(req.clientId, jobId, facilityId, newSpares, 'job', 'used');
        }
        const missingSpares = <NewSpares[]>req.body.sparesMissing;
        if (missingSpares.length > 0) {
            updateSparesForJob(req.clientId, jobId, facilityId, missingSpares, 'job', 'missing');
        }
        if (req.body.logged_time_details.length > 0) {
            LoggedTime.setTimeDetails(req.clientId, req.body.logged_time_details, 'job', jobId);
        }
        if (req.body.downtime.length > 0) {
            Downtime.setDowntimeDetails(req.clientId, req.body.downtime, 'job', jobId, facilityId);
        }
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function updateNotes(req: Request, res: Response) {
    try {
        const response = await Jobs.updateNotes(req.clientId, req.body);
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}
