import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';

export async function getAllJobs(req: Request, res: Response) {
    try {
        const allJobs = await Jobs.getAllJobs();
        res.status(200).json(allJobs);
    } catch (err) {
        res.status(500).json({ message: 'Request failed' });
    }
}
