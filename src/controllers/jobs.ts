import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';

export async function getAllJobs(req: Request, res: Response) {
    try {
        const allJobs = await Jobs.getAllJobs();
        res.status(200).json(allJobs);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const jobDetails = await Jobs.getJobDetails(id);
        res.status(200).json(jobDetails);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Request failed' });
    }
}
