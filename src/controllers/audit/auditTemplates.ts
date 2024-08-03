import { Request, Response } from 'express';
import * as AuditTemplates from '../../models/audit/auditTemplates';
import * as AuditTopics from '../../models/audit/auditTopics';
import * as AuditQuestions from '../../models/audit/auditQuestions';
import makeIdList from '../../helpers/makeIdList';
import { AuditQuestion } from '../../types/audits/auditQuestions';
import { formatQuestionOptions } from '../../helpers/audits/formatQuestionOptions';
import { formatTopicQuestions } from '../../helpers/audits/formatTopicQuestions';
import { copyTopics } from '../../helpers/audits/copyTopics';
import { copyQuestions } from '../../helpers/audits/copyQuestions';
import { copyOptions } from '../../helpers/audits/copyOptions';

export async function getAuditTemplates(req: Request, res: Response) {
    try {
        const auditTemplates = await AuditTemplates.getAuditTemplates(req.clientId);
        res.status(200).json({ auditTemplates });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getTemplateVersions(req: Request, res: Response) {
    try {
        const templateId = parseInt(req.params.id);
        const templateVersions = await AuditTemplates.getTemplateVersions(req.clientId, templateId);
        res.status(200).json({ templateVersions });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAuditTemplate(req: Request, res: Response) {
    try {
        const templateId = parseInt(req.params.templateid);
        const version = parseInt(req.params.version);
        const template = await AuditTemplates.getAuditVersion(req.clientId, templateId, version);
        let topics = await AuditTopics.getTopicsForAudit(req.clientId, template.id);
        const topicIds = makeIdList(topics, 'id');
        let questions: AuditQuestion[] = [];
        if (topicIds.length > 0) {
            questions = await AuditQuestions.getAuditQuestions(req.clientId, topicIds);
            const enumTypes = ['select', 'multi-select', 'radio'];
            const enumQuestionIds = questions.filter((question) => enumTypes.includes(question.question_type)).map((question) => question.id);
            if (enumQuestionIds.length > 0) {
                const options = await AuditQuestions.getQuestionOptions(req.clientId, enumQuestionIds);
                questions = formatQuestionOptions(questions, options);
            }
            topics = formatTopicQuestions(topics, questions);
        }
        res.status(200).json({ template, topics });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAuditTemplateLatestDetails(req: Request, res: Response) {
    try {
        const templateId = parseInt(req.params.templateid);
        const template = await AuditTemplates.getLatestDetails(req.clientId, templateId);
        res.status(200).json({ template });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addAuditTemplate(req: Request, res: Response) {
    try {
        const response = await AuditTemplates.addAuditTemplate(req.clientId, req.body.title);
        if (response) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addAuditVersion(req: Request, res: Response) {
    try {
        const templateId = parseInt(req.body.id);
        const template = await AuditTemplates.getLatestDetails(req.clientId, templateId);
        const prevVersionId = template.latest_version;
        const newVersionId = await AuditTemplates.addAuditVersion(req.clientId, req.body.title, templateId, prevVersionId + 1);
        const topicIds = await copyTopics(req.clientId, prevVersionId, newVersionId);
        if (topicIds.length > 0) {
            const questionIds = await copyQuestions(req.clientId, topicIds);
            if (questionIds.length > 0) {
                await copyOptions(req.clientId, questionIds);
            }
        }
        if (newVersionId) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}