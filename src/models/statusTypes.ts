import getConnection from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { InitialStatusId, StatusTypes } from '../types/enums';

export async function getAllStatusTypes(client: string) {
    const db = await getConnection('client_' + client);
    const data: [StatusTypes[], FieldPacket[]] = await db.execute(
        `SELECT
            *
        FROM 
            status_types
        WHERE
            deleted = 0
        ORDER BY
            list_priority;`
    );
    return data[0];
}

export async function getStatusTypeById(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            *
        FROM 
            status_types
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function getInitialStatusId(client: string) {
    const db = await getConnection('client_' + client);
    const data: [InitialStatusId[], FieldPacket[]] = await db.execute(
        `SELECT
            id
        FROM 
            status_types
        WHERE
            initial_status = 1
        AND
            deleted = 0;`
    );
    return data[0][0].id;
}

export async function addStatusType(client: string, body: { value: string; listPriority: number; canComplete: number; initialStatus: boolean }) {
    const db = await getConnection('client_' + client);
    let initial_status = body.initialStatus ? 1 : 0;
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            status_types
            (
                value,
                list_priority,
                can_complete,
                initial_status
            )
        VALUES
            (?,?,?,?);`,
        [body.value, body.listPriority, body.canComplete, initial_status]
    );
    return response[0];
}

export async function editStatusType(client: string, body: { id: number; value: string; listPriority: number; canComplete: number; initialStatus: boolean }) {
    const db = await getConnection('client_' + client);
    let initial_status = body.initialStatus ? 1 : 0;
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            status_types
        SET
            value = ?,
            list_priority = ?,
            can_complete = ?,
            initial_status = ?
        WHERE
            id = ?;`,
        [body.value, body.listPriority, body.canComplete, initial_status, body.id]
    );
    return response[0];
}

export async function clearInitialStatus(client: string) {
    const db = await getConnection('client_' + client);
    await db.execute(`UPDATE status_types SET initial_status = 0;`);
    return;
}

export async function deleteStatusType(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE status_types SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}
