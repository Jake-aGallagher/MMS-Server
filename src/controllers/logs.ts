import { Request, Response } from 'express';
import * as Logs from '../models/logs';
import { ResultSetHeader } from 'mysql2';
import { getCustomFieldData, updateFieldData } from '../models/customFields';

// Templates

export async function getAllLogTemplates(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const logTemplates = await Logs.getLogTemplates(req.clientId, facilityId);
        res.status(200).json({ logTemplates });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLogTemplate(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const logTemplateId = parseInt(req.params.logtemplateid);
        const logTemplate = await Logs.getLogTemplates(req.clientId, facilityId, logTemplateId);
        const logs = await Logs.getLogsByTemplate(req.clientId, logTemplateId);
        res.status(200).json({ logTemplate: logTemplate[0], logs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getEditLogTemplate(req: Request, res: Response) {
    try {
        const logTemplateId = parseInt(req.params.logtemplateid);
        const logTemplate = await Logs.getLogTemplateForEdit(req.clientId, logTemplateId);
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
            response = await Logs.editLogTemplate(req.clientId, req.body);
        } else {
            response = await Logs.addLogTemplate(req.clientId, req.body);
            const dueDate = req.body.startNow === 'Yes' ? 'CAST(CURDATE() as datetime)' : req.body.scheduleStart;
            await Logs.addLog(req.clientId, response.insertId, req.body.facilityId, dueDate);
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
        const response = await Logs.deleteLogTemplate(req.clientId, id);
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
        const facilityId = parseInt(req.params.facilityid);
        const logs = await Logs.getLogs(req.clientId, facilityId, true);
        res.status(200).json({ logs });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLog(req: Request, res: Response) {
    try {
        const logId = parseInt(req.params.logid);
        const log = await Logs.getLog(req.clientId, logId);
        const customFields = await getCustomFieldData(req.clientId, 'log', logId, log[0].type_id);
        res.status(200).json({ log, customFields });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function updateLog(req: Request, res: Response) {
    try {
        const response = await Logs.updateLog(req.clientId, req.body);
        await updateFieldData(req.clientId, req.body.logId, req.body.fieldData);

        if (req.body.fieldData.completed) {
            const logDates = await Logs.getLogDates(req.clientId, req.body.logId, true);
            const templateId = await Logs.getTemplateId(req.clientId, req.body.logId);
            await Logs.addLog(
                req.clientId,
                templateId,
                req.body.facilityId,
                req.body.fieldData.continueSchedule === 'Yes' ? "'" + logDates[0].current_schedule + "'" : "'" + logDates[0].new_schedule + "'"
            );
        }

        if (response.affectedRows === 1) {
            res.status(200).json({ updated: true });
        } else {
            res.status(500).json({ updated: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ updated: false });
    }
}

// Fields

export async function getLogFields(req: Request, res: Response) {
    try {
        const logId = parseInt(req.params.logid);
        const type_id = await Logs.getTemplateId(req.clientId, logId);
        const customFields = await getCustomFieldData(req.clientId, 'log', logId, type_id);
        const logDates = await Logs.getLogDates(req.clientId, logId);
        const logTitleDescription = await Logs.getLogTemplateTitle(req.clientId, logId, 'log');
        res.status(200).json({ logDates, customFields, logTitleDescription });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}
