import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { StatusTypes } from '../types/enums';

export async function getAllStatusTypes() {
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

export async function getStatusTypeById(id: number) {
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

export async function addStatusType(body: { value: string; listPriority: number; canComplete: number; initialStatus: boolean }) {
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

export async function editStatusType(body: { id: number; value: string; listPriority: number; canComplete: number; initialStatus: boolean }) {
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

export async function clearInitialStatus() {
    await db.execute(`UPDATE status_types SET initial_status = 0;`);
    return;
}

export async function deleteStatusType(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE status_types SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}
