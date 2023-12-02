import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';

export async function getAllJobTypes() {
    const data = await db.execute(
        `SELECT
            *
        FROM 
            job_types
        WHERE
            deleted = 0
        ORDER BY
            list_priority;`
    );
    return data[0];
}

export async function getJobTypeById(id: number) {
    const data = await db.execute(
        `SELECT
            *
        FROM 
            job_types
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function addJobType(body: { value: string; listPriority: number }) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            job_types
            (
                value,
                list_priority
            )
        VALUES
            (?,?);`,
        [body.value, body.listPriority]
    );
    return response[0];
}

export async function editJobType(body: { id: number; value: string; listPriority: number }) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            job_types
        SET
            value = ?,
            list_priority = ?
        WHERE
            id = ?;`,
        [body.value, body.listPriority, body.id]
    );
    return response[0];
}

export async function deleteJobType(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE job_types SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}
