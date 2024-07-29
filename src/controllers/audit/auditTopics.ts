import { Request, Response } from 'express';
import * as AuditTopics from '../../models/audit/auditTopics';
import { getVersionId } from '../../models/audit/auditTemplates';

export async function getAuditTopic(req: Request, res: Response) {
    try {
        const topicId = parseInt(req.params.topicid);
        const topic = await AuditTopics.getTopic(req.clientId, topicId);
        res.status(200).json({ topic });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditAuditTopic(req: Request, res: Response) {
    try {
        const { id, title, sortOrder, templateId, version } = req.body;
        let response;
        if (id) {
            response = await AuditTopics.editTopic(req.clientId, id, title, sortOrder);
        } else {
            const versionId = await getVersionId(req.clientId, templateId, version);
            response = await AuditTopics.addTopic(req.clientId, versionId, title, sortOrder);
        }
        if (response) {
            res.status(201).json({ created: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function deleteAuditTopic(req: Request, res: Response) {
    try {
        const topicId = parseInt(req.params.id);
        const response = await AuditTopics.deleteTopic(req.clientId, topicId);
        if (response) {
            res.status(200).json({ deleted: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}