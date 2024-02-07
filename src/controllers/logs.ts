import { Request, Response } from 'express';
import * as Logs from '../models/logs';
import { ResultSetHeader } from 'mysql2';
import { LogFieldValues, LogTemplateFields } from '../types/logs';
import { getEnumsByGroupIds } from '../models/enums';
import { enumObjForSelect } from '../helpers/enums/enumObjForSelect';
import { getFieldFileData } from '../models/files';
import { FileTypes } from '../helpers/constants';

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
        const enumGroupIds: number[] = fields.flatMap((field: LogFieldValues) =>
            field.enumGroupId !== null && field.enumGroupId > 0 ? field.enumGroupId : []
        );
        const enumGroupsRaw = await getEnumsByGroupIds(enumGroupIds);
        const enumGroups = enumObjForSelect(enumGroupsRaw);
        const fileIds = fields.flatMap((field: LogFieldValues) =>
            FileTypes.includes(field.type) && field.value?.length > 0 ? field.value.split(',') : []
        );
        const fileIdToFieldIdMap: { [key: string]: number } = {};
        fields.forEach((field: LogFieldValues) => {
            if (FileTypes.includes(field.type) && field.value?.length > 0) {
                field.value.split(',').forEach((value: string) => {
                    fileIdToFieldIdMap[value] = field.id;
                });
            }
        });
        const fileData = await getFieldFileData(fileIds, fileIdToFieldIdMap);
        res.status(200).json({ log, fields, enumGroups, fileData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function updateLog(req: Request, res: Response) {
    try {
        const response = await Logs.updateLog(req.body);
        const fieldsResponse = await Logs.updateFieldData(req.body.logId, req.body.fieldData);

        if (req.body.fieldData.completed) {
            const logDates = await Logs.getLogDates(req.body.logId, true);
            const templateId = await Logs.getTemplateId(req.body.logId);
            await Logs.addLog(
                templateId,
                req.body.propertyId,
                req.body.fieldData.continueSchedule === 'Yes' ? "'" + logDates[0].current_schedule + "'" : "'" + logDates[0].new_schedule + "'"
            );
        }

        if (response.affectedRows === 1 && fieldsResponse.affectedRows > 0) {
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
        const logFields = await Logs.getLogFields(logId);
        const logDates = await Logs.getLogDates(logId);
        const enumGroupIds: number[] = logFields.flatMap((field: LogFieldValues) =>
            field.enumGroupId !== null && field.enumGroupId > 0 ? field.enumGroupId : []
        );
        const enumGroupsRaw = await getEnumsByGroupIds(enumGroupIds);
        const enumGroups = enumObjForSelect(enumGroupsRaw);
        const fileIds = logFields.flatMap((field: LogFieldValues) =>
            FileTypes.includes(field.type) && field.value?.length > 0 ? field.value.split(',') : []
        );
        const fileIdToFieldIdMap: { [key: string]: number } = {};
        logFields.forEach((field: LogFieldValues) => {
            if (FileTypes.includes(field.type) && field.value?.length > 0) {
                field.value.split(',').forEach((value: string) => {
                    fileIdToFieldIdMap[value] = field.id;
                });
            }
        });
        const fileData = await getFieldFileData(fileIds, fileIdToFieldIdMap);
        res.status(200).json({ logFields, logDates, enumGroups, fileData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLogFieldsPreview(req: Request, res: Response) {
    try {
        const logTemplateId = parseInt(req.params.logtemplateid);
        const logTitle = await Logs.getLogTemplateTitle(logTemplateId);
        const logFields = await Logs.getLogFieldsPreview(logTemplateId);
        const enumGroupIds: number[] = logFields.flatMap((field: LogTemplateFields) =>
            field.enumGroupId !== null && field.enumGroupId > 0 ? field.enumGroupId : []
        );
        const enumGroupsRaw = await getEnumsByGroupIds(enumGroupIds);
        const enumGroups = enumObjForSelect(enumGroupsRaw);
        res.status(200).json({ logFields, logTitle, enumGroups });
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
