import { Request, Response } from 'express';
import * as UrgencyTypes from '../../models/maintenance/urgencyTypes';

export async function getUrgencyTypes(req: Request, res: Response) {
    try {
        const urgencyTypes = await UrgencyTypes.getAllUrgencyTypes(req.clientId);
        res.status(200).json({ urgencyTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getUrgencyTypeById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const urgencyType = await UrgencyTypes.getUrgencyTypeById(req.clientId, id);
        res.status(200).json({ urgencyType });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditUrgencyType(req: Request, res: Response) {
    try {
        const id = parseInt(req.body.id);
        let response;
        if (id > 0) {
            response = await UrgencyTypes.editUrgencyType(req.clientId, req.body);
        } else {
            response = await UrgencyTypes.addUrgencyType(req.clientId, req.body);
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

export async function deleteUrgencyType(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await UrgencyTypes.deleteUrgencyType(req.clientId, id);
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
