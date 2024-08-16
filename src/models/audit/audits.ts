import { FieldPacket, ResultSetHeader } from 'mysql2';
import getConnection from '../../database/database';
import { AuditId } from '../../types/audits/audits';

export async function getAuditData(client: string, event: string, eventId: number) {
    const db = await getConnection('client_' + client);
    const data: [AuditId[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            version_id
        FROM
            audits
        WHERE
            event_type = ?
        AND
            event_id = ?;`,
        [event, eventId]
    );
    return data[0][0];
}

export async function addAudit(client: string, event: string, eventId: number, versionId: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            audits
            (
                event_type,
                event_id,
                version_id
            )
        VALUES
            (?, ?, ?);`,
        [event, eventId, versionId]
    );

    return response[0].insertId;
}
