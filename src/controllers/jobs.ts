import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';

export async function getAllJobs(req: Request, res: Response) {
    const allJobs = await Jobs.getAllJobs();
    res.status(200).json(allJobs);
}
