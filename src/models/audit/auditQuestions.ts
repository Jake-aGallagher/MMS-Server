import { FieldPacket, ResultSetHeader } from 'mysql2';
import getConnection from '../../database/database';
import { AuditOption, AuditQuestion, AuditQuestionOption } from '../../types/audits/auditQuestions';

export async function getAuditQuestions(client: string, topicIds: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
    `SELECT
        id,
        topic_id,
        title,
        question_type,
        sort_order
    FROM
        audit_questions
    WHERE
        topic_id IN (?)
    AND
        deleted = 0;`,
        [topicIds]
    );
    const data: [AuditQuestion[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function getAuditQuestion(client: string, questionId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditQuestion[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            topic_id,
            title,
            question_type,
            sort_order
        FROM
            audit_questions
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [questionId]
    );
    return data[0][0];
}

export async function getQuestionOptions(client: string, questionIds: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
    `SELECT
        id,
        question_id,
        title
    FROM
        audit_question_options
    WHERE
        question_id IN (?)
    AND
        deleted = 0;`,
        [questionIds]
    );
    const data: [AuditQuestionOption[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function addQuestion(client: string, topicId: number, questionType: string, title: string, sortOrder: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audit_questions
            (
                topic_id,
                title,
                question_type,
                sort_order
            )
        VALUES
            (?, ?, ?, ?);`,
        [topicId, title, questionType, sortOrder]
    );
    return response[0].insertId;
}

export async function editQuestion(client: string, id: number, questionType: string, title: string, sortOrder: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            audit_questions
        SET
            question_type = ?,
            title = ?,
            sort_order = ?
        WHERE
            id = ?;`,
        [questionType, title, sortOrder, id]
    );
    return response[0];
}

export async function addQuestionOption(client: string, questionId: number, title: string) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audit_question_options
            (
                question_id,
                title
            )
        VALUES
            (?, ?);`,
        [questionId, title]
    );
    return response[0];
}

export async function deleteQuestion(client: string, questionId: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            audit_questions
        SET
            deleted = 1,
            deleted_date = NOW()
        WHERE
            id = ?;`,
        [questionId]
    );
    return response[0];
}

// Options

export async function getAuditOption(client: string, optionId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditOption[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            question_id,
            title,
            sort_order
        FROM
            audit_question_options
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [optionId]
    );
    return data[0][0];
}

export async function addOption(client: string, questionId: number, title: string, sortOrder: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audit_question_options
            (
                question_id,
                title,
                sort_order
            )
        VALUES
            ( ?, ?, ?);`,
        [questionId, title, sortOrder]
    );
    return response[0].insertId;
}

export async function editOption(client: string, id: number, title: string, sortOrder: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            audit_question_options
        SET
            title = ?,
            sort_order = ?
        WHERE
            id = ?;`,
        [title, sortOrder, id]
    );
    return response[0];
}

export async function deleteOption(client: string, optionId: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            audit_question_options
        SET
            deleted = 1,
            deleted_date = NOW()
        WHERE
            id = ?;`,
        [optionId]
    );
    return response[0];
}