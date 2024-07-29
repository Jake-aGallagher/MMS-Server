import { Request, Response } from 'express';
import * as AuditQuestions from '../../models/audit/auditQuestions';

export async function getAuditQuestion(req: Request, res: Response) {
    try {
        const questionId = parseInt(req.params.questionid);
        const question = await AuditQuestions.getAuditQuestion(req.clientId, questionId);
        res.status(200).json({ question });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditAuditQuestion(req: Request, res: Response) {
    try {
        const { id, questionType, title, sortOrder, topicId } = req.body;
        let response;
        if (id) {
            response = await AuditQuestions.editQuestion(req.clientId, id, questionType, title, sortOrder);
        } else {
            response = await AuditQuestions.addQuestion(req.clientId, topicId, questionType, title, sortOrder);
        }
        if (response) {
            res.status(201).json({ created: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function deleteAuditQuestion(req: Request, res: Response) {
    try {
        const questionId = parseInt(req.params.id);
        const response = await AuditQuestions.deleteQuestion(req.clientId, questionId);
        if (response) {
            res.status(200).json({ deleted: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAuditOption(req: Request, res: Response) {
    try {
        const optionId = parseInt(req.params.optionid);
        const option = await AuditQuestions.getAuditOption(req.clientId, optionId);
        res.status(200).json({ option });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditAuditOption(req: Request, res: Response) {
    try {
        const { id, title, sortOrder, questionId } = req.body;
        let response;
        if (id) {
            response = await AuditQuestions.editOption(req.clientId, id, title, sortOrder);
        } else {
            response = await AuditQuestions.addOption(req.clientId, questionId, title, sortOrder);
        }
        if (response) {
            res.status(201).json({ created: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function deleteAuditOption(req: Request, res: Response) {
    try {
        const optionId = parseInt(req.params.id);
        const response = await AuditQuestions.deleteOption(req.clientId, optionId);
        if (response) {
            res.status(200).json({ deleted: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}