import { Request, Response } from 'express';
import * as Logs from '../models/logs';
import { ResultSetHeader } from 'mysql2';

// Templates

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

export async function getLogTemplate(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const logTemplateId = parseInt(req.params.logtemplateid);
        const logTemplate = await Logs.getLogTemplates(propertyId, logTemplateId);
        res.status(200).json({ logTemplate: logTemplate[0] });
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
            const dueDate = req.body.startNow === 'Yes' ? 'CAST(CURDATE() as datetime)' : req.body.scheduleStart;
            await Logs.addLog(response.insertId, req.body.propertyId, dueDate);
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

// Logs

export async function getAllLogs(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const logs = await Logs.getLogs(propertyId);
        res.status(200).json({ logs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLog(req: Request, res: Response) {
    try {
        const logId = parseInt(req.params.logid);
        const { log, fields } = await Logs.getLog(logId);
        console.log(log, fields)
        res.status(200).json({ log, fields });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

// Fields

export async function getLogFields(req: Request, res: Response) {
    try {
        const logTemplateId = parseInt(req.params.logtemplateid);
        const logTitle = await Logs.getLogTemplateTitle(logTemplateId);
        const logFields = await Logs.getLogFields(logTemplateId);
        res.status(200).json({ logFields, logTitle });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditLogField(req: Request, res: Response) {
    try {
        const logFieldId = parseInt(req.params.logfieldid);
        const logField = await Logs.getLogFieldForEdit(logFieldId);
        res.status(200).json({ logField });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditLogField(req: Request, res: Response) {
    try {
        let response: ResultSetHeader;
        if (req.body.id > 0) {
            response = await Logs.editLogField(req.body);
        } else {
            response = await Logs.addLogField(req.body);
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

export async function deleteLogField(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const response = await Logs.deleteLogField(id);
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
