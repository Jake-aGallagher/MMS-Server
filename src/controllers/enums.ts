import { Request, Response } from 'express';
import * as Enums from '../models/enums';

export async function getEnumsForCreateJob(req: Request, res: Response) {
    try {
        const urgency = await Enums.getEnumOptions('urgency options');
        const types = await Enums.getEnumOptions('job types');
        res.status(200).json({ types, urgency });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumsForSettings(req: Request, res: Response) {
    try {
        const enums = await Enums.getAllEnum();
        const enumTypes = await Enums.getEnumTypes();
        res.status(200).json({ enums, enumTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumTypesForEdit(req: Request, res: Response) {
    try {
        const enumTypes = await Enums.getEnumTypes();
        res.status(200).json({ enumTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumForEdit(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const chosenEnum = await Enums.getEnumById(id);
        const enumTypes = await Enums.getEnumTypes();
        res.status(200).json({ chosenEnum, enumTypes });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditEnum(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        let response;
        if (id > 0) {
            response = await Enums.editEnum(req.body);
        } else {
            response = await Enums.addEnum(req.body);
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