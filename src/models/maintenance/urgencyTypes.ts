import getConnection from '../../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { PayloadBasics } from '../../types/enums';

export async function getAllUrgencyTypes(client: string, ) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            *
        FROM 
            urgency_types
        WHERE
            deleted = 0
        ORDER BY
            list_priority;`
    );
    return data[0];
}

export async function getUrgencyTypeById(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            *
        FROM 
            urgency_types
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function getUrgencyPayload(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data: [PayloadBasics[], FieldPacket[]] = await db.execute(
        `SELECT
            urgency_number AS number,
            urgency_period AS duration
        FROM
            urgency_types
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function addUrgencyType(client: string, body: { value: string; listPriority: number; urgencyNumber: number; urgencyPeriod: string }) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            urgency_types
            (
                value,
                list_priority,
                urgency_number,
                urgency_period
            )
        VALUES
            (?,?,?,?);`,
        [body.value, body.listPriority, body.urgencyNumber, body.urgencyPeriod]
    );
    return response[0];
}

export async function editUrgencyType(client: string, body: { id: number; value: string; listPriority: number; urgencyNumber: number; urgencyPeriod: string }) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            urgency_types
        SET
            value = ?,
            list_priority = ?,
            urgency_number = ?,
            urgency_period = ?
        WHERE
            id = ?;`,
        [body.value, body.listPriority, body.urgencyNumber, body.urgencyPeriod, body.id]
    );
    return response[0];
}

export async function deleteUrgencyType(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE urgency_types SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}
