import { FieldPacket, ResultSetHeader } from "mysql2";
import getConnection from "../../database/database";
import { AuditTopic } from "../../types/audits/auditTopics";

export async function getTopicsForAudit(client: string, templateVersionId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditTopic[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            title,
            sort_order
        FROM
            audit_topics
        WHERE
            version_id = ?
        AND
            deleted = 0;`,
        [templateVersionId]
    );
    return data[0];
}

export async function getTopic(client: string, topicId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditTopic[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            title,
            sort_order
        FROM
            audit_topics
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [topicId]
    );
    return data[0][0];
}

export async function addTopic(client: string, versionId: number, title: string, sortOrder: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audit_topics
            (
                version_id,
                title,
                sort_order
            )
        VALUES
            (?, ?, ?);`,
        [versionId, title, sortOrder]
    );
    return response[0];
}

export async function editTopic(client: string, topicId: number, title: string, sortOrder: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            audit_topics
        SET
            title = ?,
            sort_order = ?
        WHERE
            id = ?;`,
        [title, sortOrder, topicId]
    );
    return response[0];
}

export async function deleteTopic(client: string, topicId: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            audit_topics
        SET
            deleted = 1,
            deleted_date = NOW()
        WHERE
            id = ?;`,
        [topicId]
    );
    return response[0];
}