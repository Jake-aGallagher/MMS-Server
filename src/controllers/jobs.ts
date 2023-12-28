import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';
import * as Properties from '../models/properties';
import * as Users from '../models/users';
import * as Spares from '../models/spares';
import * as TypeEnums from '../models/jobTypes';
import * as StatusEnums from '../models/statusTypes';
import * as UrgencyEnums from '../models/urgencyTypes';
import * as LoggedTime from '../models/loggedTime';
import makeIdList from '../helpers/makeIdList';
import timeDetailsArray from '../helpers/jobs/timeDetailsArray';
import { updateSparesForJob } from '../helpers/jobs/updateSparesForJob';
import { NewSpares } from '../types/spares';
import { insertFiles } from '../helpers/files/insertFiles';
import calcTotalLoggedTime from '../helpers/jobs/calcTotalLoggedTime';
import { getFileIds } from '../helpers/files/getFileIds';
import { PayloadBasics } from '../types/enums';
import { ResultSetHeader } from 'mysql2';

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
        const usedSpares = await Spares.getUsedSpares('job', id);
        const timeDetails = await LoggedTime.getLoggedTimeDetails('job', id);
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
        const completableStatus = statusOptions.filter((item) => item.can_complete).map((item) => item.id);
        const jobDetails = await Jobs.getJobDetails(id);
        let scheduleDates: any;
        if (jobDetails[0].scheduled) {
            scheduleDates = await Jobs.getScheduleDates(id);
        }
        const users = await Properties.getAssignedUsers(propertyId);
        const timeDetails = await LoggedTime.getLoggedTimeDetails('job', id);
        const usedSpares = await Spares.getUsedSpares('job', id);
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, jobDetails, users, usedSpares, completableStatus, scheduleDates, timeDetails });
        } else {
            res.status(200).json({ statusOptions, jobDetails, users, usedSpares, completableStatus, scheduleDates });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postJob(req: Request, res: Response) {
    try {
        let urgency: PayloadBasics[] = [];
        if (req.body.breakdownOrSchedule == 'Breakdown') {
            const urgencyReq = req.body.urgency;
            urgency = await UrgencyEnums.getUrgencyPayload(urgencyReq);
        }
        let response: ResultSetHeader;
        if (req.body.breakdownOrSchedule == 'Breakdown') {
            response = await Jobs.postJob(req.body, urgency);
        } else {
            req.body.scheduleStart = '"' + req.body.scheduleStart + '"';
            response = await Jobs.postScheduledJob(req.body);
        }
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
            LoggedTime.setTimeDetails(req.body.logged_time_details, 'job', jobId);
        }
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            insertFiles(req.files, 'job', jobId);
        }

        if (req.body.complete) {
            const scheduled = await Jobs.checkIfJobIsScheduled(jobId);
            if (scheduled[0].scheduled == 1) {
                const details = await Jobs.getScheduledJobForReentry(jobId);
                const body = {
                    propertyNumber: details[0].property_id.toString(),
                    assetNumber: details[0].asset.toString(),
                    breakdownOrSchedule: 'Scheduled',
                    type: details[0].type.toString(),
                    title: details[0].title,
                    description: details[0].description,
                    urgency: '0',
                    reporter: details[0].reporter,
                    startNow: 'No',
                    scheduleStart:
                        req.body.continueSchedule == 'Yes'
                            ? `DATE_ADD("${details[0].required_comp_date}", INTERVAL ${details[0].frequency_time} ${details[0].frequency_unit})`
                            : `DATE_ADD(CURDATE(), INTERVAL ${details[0].frequency_time} ${details[0].frequency_unit})`,
                    intervalFrequency: details[0].frequency_time,
                    intervalTimeUnit: details[0].frequency_unit,
                };
                Jobs.postScheduledJob(body);
            }
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
