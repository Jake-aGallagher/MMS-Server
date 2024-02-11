import { Request, Response } from 'express';
import * as CustomFields from '../models/customFields';
import { getEnumGroups } from '../models/enums';

export async function getFieldsForModel(req: Request, res: Response) {
    try {
        res.status(200).json(await CustomFields.getCustomFieldData(req.params.model, 0));
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getFieldById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const field = await CustomFields.getFieldById(id);
        const enums = await getEnumGroups()
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
            response = await CustomFields.editField(req.body.id, req.body);
        } else {
            response = await CustomFields.addField(req.body);
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
        const response = await CustomFields.deleteField(id);
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