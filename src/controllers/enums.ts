import { Request, Response } from 'express';
import * as Enums from '../models/enums';

export async function getEnumsGroups(req: Request, res: Response) {
    try {
        const enumGroups = await Enums.getEnumGroups(req.clientId);
        res.status(200).json({ enumGroups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumsGroupById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const enumGroup = await Enums.getEnumGroupById(req.clientId, id);
        res.status(200).json({ enumGroup });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumsByGroupId(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const enums = await Enums.getEnumsByGroupId(req.clientId, id);
        res.status(200).json({ enums });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEnumValueById(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const enums = await Enums.getEnumValueById(req.clientId, id);
        res.status(200).json({ enums });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditEnumGroup(req: Request, res: Response) {
    try {
        const id = parseInt(req.body.id);
        let response;
        if (id > 0) {
            response = await Enums.editEnumGroup(req.clientId, req.body);
        } else {
            response = await Enums.addEnumGroup(req.clientId, req.body);
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

export async function addEditEnumValue(req: Request, res: Response) {
    try {
        const id = parseInt(req.body.id);
        let response;
        if (id > 0) {
            response = await Enums.editEnumValue(req.clientId, req.body);
        } else {
            response = await Enums.addEnumValue(req.clientId, req.body);
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

export async function deleteEnumGroup(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Enums.deleteEnumGroup(req.clientId, id);
        Enums.deleteEnumValueByGroupId(req.clientId, id);
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

export async function deleteEnumValue(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Enums.deleteEnumValue(req.clientId, id);
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
