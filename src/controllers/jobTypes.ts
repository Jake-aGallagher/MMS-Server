import { Request, Response } from 'express';
import * as JobTypes from '../models/jobTypes';

export async function getJobTypes(req: Request, res: Response) {
    try {
        const jobTypes = await JobTypes.getAllJobTypes();
        res.status(200).json({ jobTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobTypeById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const jobType = await JobTypes.getJobTypeById(id);
        res.status(200).json({ jobType });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditJobType(req: Request, res: Response) {
    try {
        const id = parseInt(req.body.id);
        let response;
        if (id > 0) {
            response = await JobTypes.editJobType(req.body);
        } else {
            response = await JobTypes.addJobType(req.body);
        }
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function deleteJobType(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await JobTypes.deleteJobType(id);
        if (deleted.affectedRows > 0) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}
