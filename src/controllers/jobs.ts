import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';
import * as Properties from '../models/properties';
import * as Users from '../models/users';
import * as Spares from '../models/spares';
import * as TypeEnums from '../models/jobTypes';
import * as StatusEnums from '../models/statusTypes';
import * as UrgencyEnums from '../models/urgencyTypes';
import makeIdList from '../helpers/makeIdList';
import timeDetailsArray from '../helpers/jobs/timeDetailsArray';
import { updateSparesForJob } from '../helpers/jobs/updateSparesForJob';
import { NewSpares } from '../types/spares';
import { insertFiles } from '../helpers/files/insertFiles';
import calcTotalLoggedTime from '../helpers/jobs/calcTotalLoggedTime';
import { getFileIds } from '../helpers/files/getFileIds';

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
        const files = await getFileIds('job', id);
        const usedSpares = await Spares.getUsedSpares(id);
        const timeDetails = await Jobs.getLoggedTimeDetails(id);
        if (timeDetails.length > 0) {
            const userIds = makeIdList(timeDetails, 'id');
            const users = await Users.getUsersByIds(userIds);
            const timeDetailsFull = timeDetailsArray(timeDetails, users);
            res.status(200).json({ jobDetails, files, timeDetails: timeDetailsFull, usedSpares });
        } else {
            res.status(200).json({ jobDetails, files, usedSpares });
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
        const completableStatus = statusOptions.filter((item) => item.can_complete).map((item) => item.id)
        const jobDetails = await Jobs.getJobDetails(id);
        const users = await Properties.getAssignedUsers(propertyId);
        const timeDetails = await Jobs.getLoggedTimeDetails(id);
        const usedSpares = await Spares.getUsedSpares(id);
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, jobDetails, users, usedSpares, completableStatus, timeDetails });
        } else {
            res.status(200).json({ statusOptions, jobDetails, users, usedSpares, completableStatus });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postJob(req: Request, res: Response) {
    try {
        const urgencyReq = req.body.urgency;
        const urgency = await UrgencyEnums.getUrgencyPayload(urgencyReq)
        const response = await Jobs.postJob(req.body, urgency);
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
        const newSpares = <NewSpares[]>req.body.sparesUsed;
        if (newSpares.length > 0) {
            updateSparesForJob(jobId, propertyId, newSpares);
        }
        if (req.body.logged_time_details.length > 0) {
            Jobs.setTimeDetails(req.body.logged_time_details, jobId);
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
