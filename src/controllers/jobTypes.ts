import { Request, Response } from 'express';
import * as TaskTypes from '../models/taskTypes';

export async function getJobTypes(req: Request, res: Response) {
    try {
        const taskTypes = await TaskTypes.getAllJobTypes(req.clientId);
        res.status(200).json({ taskTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobTypeById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const taskType = await TaskTypes.getJobTypeById(req.clientId, id);
        res.status(200).json({ taskType });
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
            response = await TaskTypes.editJobType(req.clientId, req.body);
        } else {
            response = await TaskTypes.addJobType(req.clientId, req.body);
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
        const deleted = await TaskTypes.deleteJobType(req.clientId, id);
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
