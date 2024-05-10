import { Request, Response } from 'express';
import * as CustomFields from '../models/customFields';
import { getEnumGroups } from '../models/enums';

export async function getFieldsForModel(req: Request, res: Response) {
    try {
        const modeltTypeId = parseInt(req.params.modeltypeid);
        res.status(200).json(await CustomFields.getCustomFieldData(req.clientId, req.params.model, 0, modeltTypeId));
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getFieldById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const field = await CustomFields.getFieldById(req.clientId, id);
        const enums = await getEnumGroups(req.clientId);
        res.status(200).json({ field, enums });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditField(req: Request, res: Response) {
    try {
        let response: number;
        if (req.body.id > 0) {
            response = await CustomFields.editField(req.clientId, req.body.id, req.body);
        } else {
            response = await CustomFields.addField(req.clientId, req.body);
        }
        if (response) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function deleteField(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const response = await CustomFields.deleteField(req.clientId, id);
        if (response) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}
