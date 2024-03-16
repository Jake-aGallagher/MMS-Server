import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';
import * as Properties from '../models/properties';
import * as Users from '../models/users';
import * as Spares from '../models/spares';
import * as TypeEnums from '../models/taskTypes';
import * as StatusEnums from '../models/statusTypes';
import * as UrgencyEnums from '../models/urgencyTypes';
import * as LoggedTime from '../models/loggedTime';
import * as Downtime from '../models/downtime';
import makeIdList from '../helpers/makeIdList';
import timeDetailsArray from '../helpers/jobs/timeDetailsArray';
import { updateSparesForJob } from '../helpers/jobs/updateSparesForJob';
import { NewSpares } from '../types/spares';
import { insertFiles } from '../helpers/files/insertFiles';
import calcTotalLoggedTime from '../helpers/jobs/calcTotalLoggedTime';
import { getFileIds } from '../helpers/files/getFileIds';
import { getCustomFieldData, updateFieldData } from '../models/customFields';

export async function getAllJobs(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const allJobs = await Jobs.getAllJobs(propertyId);
        res.status(200).json(allJobs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const jobDetails = await Jobs.getJobDetails(id);
        const customFields = await getCustomFieldData('job', id, jobDetails[0].type_id);
        const files = await getFileIds('job', id);
        const usedSpares = await Spares.getUsedSpares('job', id, 'used');
        const missingSpares = await Spares.getUsedSpares('job', id, 'missing');
        const timeDetails = await LoggedTime.getLoggedTimeDetails('job', id);
        const downtime = await Downtime.getDowntimeDetails('job', id);
        if (timeDetails.length > 0) {
            const userIds = makeIdList(timeDetails, 'id');
            const users = await Users.getUsersByIds(userIds);
            const timeDetailsFull = timeDetailsArray(timeDetails, users);
            res.status(200).json({ jobDetails, customFields, files, timeDetails: timeDetailsFull, usedSpares, missingSpares, downtime });
        } else {
            res.status(200).json({ jobDetails, customFields, files, usedSpares, missingSpares, downtime});
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumsForCreateJob(req: Request, res: Response) {
    try {
        const urgency = await UrgencyEnums.getAllUrgencyTypes();
        const types = await TypeEnums.getAllJobTypes();
        res.status(200).json({ types, urgency });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobUpdate(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const propertyId = parseInt(req.params.propertyid);
        const statusOptions = await StatusEnums.getAllStatusTypes();
        const completableStatus = statusOptions.filter((item) => item.can_complete).map((item) => item.id);
        const jobDetails = await Jobs.getJobDetails(id);
        const customFields = await getCustomFieldData('job', id, jobDetails[0].type_id);
        const users = await Properties.getAssignedUsers(propertyId);
        const timeDetails = await LoggedTime.getLoggedTimeDetails('job', id);
        const usedSpares = await Spares.getUsedSpares('job', id, 'used');
        const missingSpares = await Spares.getUsedSpares('job', id, 'missing');
        const downtime = await Downtime.getDowntimeDetails('job', id);
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
        const urgency = await UrgencyEnums.getUrgencyPayload(urgencyReq);
        const response = await Jobs.postJob(req.body, urgency);
        await updateFieldData(response.insertId, req.body.fieldData);
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
        req.body = JSON.parse(req.body.data);
        const jobId = parseInt(req.body.id);
        const propertyId = parseInt(req.body.propertyId);
        const totalTime = calcTotalLoggedTime(req.body.logged_time_details);
        const response = await Jobs.updateAndComplete(req.body, totalTime);
        await updateFieldData(req.body.id, req.body.fieldData);
        const newSpares = <NewSpares[]>req.body.sparesUsed;
        if (newSpares.length > 0) {
            updateSparesForJob(jobId, propertyId, newSpares, 'job', 'used');
        }
        const missingSpares = <NewSpares[]>req.body.sparesMissing;
        if (missingSpares.length > 0) {
            updateSparesForJob(jobId, propertyId, missingSpares, 'job', 'missing');
        }
        if (req.body.logged_time_details.length > 0) {
            LoggedTime.setTimeDetails(req.body.logged_time_details, 'job', jobId);
        }
        if (req.body.downtime.length > 0) {
            Downtime.setDowntimeDetails(req.body.downtime, 'job', jobId, propertyId);
        }
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            insertFiles(req.files, 'job', jobId);
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
        const response = await Jobs.updateNotes(req.body);
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
