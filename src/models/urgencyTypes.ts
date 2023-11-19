import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';

export async function getAllUrgencyTypes() {
    const data = await db.execute(
        `SELECT
            *
        FROM 
            urgency_types
        ORDER BY
            list_priority;`
    );
    return data[0];
}

export async function getUrgencyTypeById(id: number) {
    const data = await db.execute(
        `SELECT
            *
        FROM 
            urgency_types
        WHERE
            id = ?;`,
        [id]
    );
    return data[0];
}

export async function addUrgencyType(body: { value: string; listPriority: number, urgencyNumber: number, urgencyPeriod: string }) {
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
        [body.value, body.listPriority, body.urgencyNumber, body.urgencyPeriod ]
    );
    return response[0];
}

export async function editUrgencyType(body: { id: number; value: string; listPriority: number, urgencyNumber: number, urgencyPeriod: string }) {
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

export async function deleteUrgencyType(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            urgency_types
        WHERE
            id = ?;`,
        [id]
    );
    return response[0];
}
