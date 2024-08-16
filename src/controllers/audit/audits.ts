import { Request, Response } from 'express';
import { AuditTopic } from '../../types/audits/auditTopics';
import { buildAuditView } from '../../helpers/audits/buildAuditView';
import * as Audits from '../../models/audit/audits';
import * as AuditResponses from '../../models/audit/auditResponses';

export async function getAudit(req: Request, res: Response) {
    try {
        const eventType = req.params.eventtype;
        const eventId = parseInt(req.params.eventid);
        const auditData = await Audits.getAuditData(req.clientId, eventType, eventId);
        let audit: AuditTopic[] = [];
        let files: { [key: string]: { id: string; encodedId: string; name: string }[] } = {};
        if (auditData.version_id > 0 && auditData.id > 0) {
            const formattedAudit = await buildAuditView(req.clientId, auditData.version_id, auditData.id);
            audit = formattedAudit.topics;
            files = formattedAudit.fileData;
        }
        res.status(200).json({ auditId: auditData.id, audit, files });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function editAudit(req: Request, res: Response) {
    try {
        const id: number = parseInt(req.body.id);
        const data: {[key: string]: string | string[]} = req.body.data;
        const questionIds: number[] = Object.keys(data).map(key => parseInt(key));
        const cleanData: {question_id: number; response: string}[] = [];
        questionIds.forEach((questionId: number) => {
            const value = data[questionId];
            const valueString = Array.isArray(value) ? value.join(',') : value;
            cleanData.push({question_id: questionId, response: valueString});
        })
        const response = await AuditResponses.updateResponses(req.clientId, id, cleanData);
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
