import { Request, Response } from 'express';
import * as Logs from '../models/logs';
import { ResultSetHeader } from 'mysql2';

export async function getAllLogTemplates(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const logTemplates = await Logs.getLogTemplates(propertyId);
        res.status(200).json({ logTemplates });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditLogTemplate(req: Request, res: Response) {
    try {
        const logTemplateId = parseInt(req.params.logtemplateid);
        const logTemplate = await Logs.getLogTemplateForEdit(logTemplateId);
        res.status(200).json({ logTemplate });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }

}

export async function addEditLogTemplate(req: Request, res: Response) {
    try {
        let response: ResultSetHeader;
        if (req.body.id > 0) {
            response = await Logs.editLogTemplate(req.body);
        } else {
            response = await Logs.addLogTemplate(req.body);
        }
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function deleteLogTemplate(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const response = await Logs.deleteLogTemplate(id);
        if (response.affectedRows === 1) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}