import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';

export async function getAllStatusTypes() {
    const data = await db.execute(
        `SELECT
            *
        FROM 
            status_types
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
            id = ?;`,
        [id]
    );
    return data[0];
}

export async function addStatusType(body: { value: string; listPriority: number, canComplete?: boolean }) {
    let completeable = body.canComplete ? 1 : 0;
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            status_types
            (
                value,
                list_priority,
                can_complete
            )
        VALUES
            (?,?,?);`,
        [body.value, body.listPriority, completeable ]
    );
    return response[0];
}

export async function editStatusType(body: { id: number; value: string; listPriority: number, canComplete?: boolean }) {
    let completeable = body.canComplete ? 1 : 0;
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            status_types
        SET
            value = ?,
            list_priority = ?,
            can_complete = ?
        WHERE
            id = ?;`,
        [body.value, body.listPriority, completeable, body.id]
    );
    return response[0];
}

export async function deleteStatusType(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            status_types
        WHERE
            id = ?;`,
        [id]
    );
    return response[0];
}
