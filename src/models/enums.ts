import { RowDataPacket, FieldPacket } from 'mysql2';
import db from '../database/database';

export async function getUrgencyOptions() {
    const data = await db.execute(
        `SELECT 
            enums.value
        FROM 
            enums
        INNER JOIN enum_types ON
            enum_types.id = enums.enum_type_id
        WHERE
            enum_types.type = 'urgency options'
        ORDER BY
            enums.list_priority;`
    );
    return data[0];
}

export async function getTypeOptions() {
    const data = await db.execute(
        `SELECT 
            enums.value
        FROM 
            enums
        INNER JOIN enum_types ON
            enum_types.id = enums.enum_type_id
        WHERE
            enum_types.type = 'job types'
        ORDER BY
            enums.list_priority;`
    );
    return data[0];
}

interface PayloadBasics extends RowDataPacket {
    number: string;
    duration: string;
}

export async function getUrgencyPayload(value: string) {
    const data: [PayloadBasics[], FieldPacket[]] = await db.execute(
        `SELECT
            payload AS number,
            payload_two AS duration
        FROM
            enums
        WHERE
            value = ?;`,
        [value]
    )
    return data[0]
}

export async function getStatusOptions() {
    const data = await db.execute(
        `SELECT 
            enums.value
        FROM 
            enums
        INNER JOIN enum_types ON
            enum_types.id = enums.enum_type_id
        WHERE
            enum_types.type = 'status'
        ORDER BY
            enums.list_priority;`
    );
    return data[0];
}