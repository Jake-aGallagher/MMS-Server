import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';
import * as Enums from '../models/enums';
import * as Properties from '../models/properties';
import * as Users from '../models/users';

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

interface TimeDetailsFull {
    id: number;
    time: number;
    first: string;
    last: string;
}

export async function getJobDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const jobDetails = await Jobs.getJobDetails(id);
        const timeDetails = await Jobs.getLoggedTimeDetails(id);
        let userIds = <number[]>[];
        if (timeDetails.length > 0) {
            timeDetails.forEach((pair) => {
                userIds.push(pair.id);
            });
            const users = await Users.getUsersByIds(userIds);
            let timeDetailsFull = <TimeDetailsFull[]>[];
            timeDetails.map((pair) => {
                const i = users.findIndex((j) => j.id === pair.id);
                if (i > -1) {
                    timeDetailsFull.push({ id: pair.id, time: pair.time, first: users[i].first, last: users[i].last });
                } else {
                    timeDetailsFull.push({ id: pair.id, time: pair.time, first: 'Unknown', last: 'Unknown' });
                }
            });
            res.status(200).json({ jobDetails, timeDetails: timeDetailsFull });
        } else {
            res.status(200).json({ jobDetails });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobUpdate(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const propertyId = parseInt(req.params.propertyid);
        const statusOptions = await Enums.getStatusOptions();
        const jobDetails = await Jobs.getJobDetails(id);
        const users = await Properties.getAssignedUsers(propertyId);
        const timeDetails = await Jobs.getLoggedTimeDetails(id);
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, jobDetails, users, timeDetails });
        } else {
            res.status(200).json({ statusOptions, jobDetails, users });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postJob(req: Request, res: Response) {
    try {
        const urgencyReq = req.body.urgency;
        const urgency = await Enums.getUrgencyPayload(urgencyReq);
        const response = await Jobs.postJob(req.body, urgency);
        console.log(response)
        // @ts-ignore
        if (response.affectedRows == '1') {
            // @ts-ignore
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
        const response = await Jobs.updateAndComplete(req.body);
        console.log(req.body.logged_time_details, req.body.id);
        if (req.body.logged_time_details.length > 0) {
            // @ts-ignore
            const timeDetails = await Jobs.setTimeDetails(req.body.logged_time_details, parseInt(req.body.id));
        }
        // @ts-ignore
        if (response.affectedRows == '1') {
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
        // @ts-ignore
        if (response.affectedRows == '1') {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}
