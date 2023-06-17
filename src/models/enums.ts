import { FieldPacket } from 'mysql2';
import { PayloadBasics } from '../types/enums';
import db from '../database/database';

export async function getEnumOptions(enumTypeString: string) {
    const data = await db.execute(
        `SELECT
            enums.id,
            enums.value
        FROM 
            enums
        INNER JOIN enum_types ON
            enum_types.id = enums.enum_type_id
        WHERE
            enum_types.type = ?
        ORDER BY
            enums.list_priority;`,
        [enumTypeString]
    );
    return data[0];
}

export async function getAllEnum() {
    const data = await db.execute(
        `SELECT
            enums.*,
            enum_types.type AS typeString
        FROM 
            enums
        INNER JOIN enum_types ON
            enum_types.id = enums.enum_type_id
        ORDER BY
            enums.list_priority;`
    );
    return data[0];
}

export async function getEnumTypes() {
    const data = await db.execute(
        `SELECT
            id,
            type
        FROM
            enum_types;`
    );
    return data[0];
}

export async function getUrgencyPayload(id: number) {
    const data: [PayloadBasics[], FieldPacket[]] = await db.execute(
        `SELECT
            payload AS number,
            payload_two AS duration
        FROM
            enums
        WHERE
            id = ?;`,
        [id]
    );
    return data[0];
}
