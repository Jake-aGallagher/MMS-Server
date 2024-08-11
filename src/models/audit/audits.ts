import { FieldPacket, ResultSetHeader } from 'mysql2';
import getConnection from '../../database/database';

export async function addAudit(client: string, event: string, eventId: number, versionId: number) {
    const db = await getConnection('client_' + client);
    console.log('Adding audit for event:', event, 'with event id:', eventId, 'and version id:', versionId);

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
