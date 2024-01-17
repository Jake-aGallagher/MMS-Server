import { Request, Response } from 'express';
import * as StatusTypes from '../models/statusTypes';

export async function getStatusTypes(req: Request, res: Response) {
    try {
        const statusTypes = await StatusTypes.getAllStatusTypes();
        res.status(200).json({ statusTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getStatusTypeById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const statusType = await StatusTypes.getStatusTypeById(id);
        res.status(200).json({ statusType });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditStatusType(req: Request, res: Response) {
    try {
        const id = parseInt(req.body.id);
        let response;
        if (req.body.initialStatus == true) {
            await StatusTypes.clearInitialStatus();// todo - this should be a transaction
        }
        if (id > 0) {
            response = await StatusTypes.editStatusType(req.body);
        } else {
            response = await StatusTypes.addStatusType(req.body);
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

export async function deleteStatusType(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const initial = await StatusTypes.getInitialStatusId();
        if (initial === id) {
            res.status(200).json({ deleted: false, message: 'Cannot delete the initial status' });
            return;
        }
        const deleted = await StatusTypes.deleteStatusType(id);
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
