import { FieldPacket, ResultSetHeader } from 'mysql2';
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

export async function getEnumById(id: number) {
    const data = await db.execute(
        `SELECT
            *
        FROM 
            enums
        WHERE
            id = ?;`,
        [id]
    );
    return data[0];
}

export async function getEnumTypes() {
    const data = await db.execute(
        `SELECT
            id,
            type
        FROM
            enum_types
        ORDER BY
            id;`
    );
    return data[0];
}

export async function addEnum(body: { value: string; enumTypeId: number; listPriority: number; payload: number; payloadTwo: string }) {
    const value = body.value;
    const enumTypeId = body.enumTypeId;
    const listPriority = body.listPriority;
    const payload = body.payload;
    const payloadTwo = body.payloadTwo;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            enums
            (
                enum_type_id,
                value,
                list_priority,
                payload,
                payload_two
            )
        VALUES
            (?,?,?,?,?);`,
        [enumTypeId, value, listPriority, enumTypeId === 1 ? payload : null, enumTypeId === 1 ? payloadTwo : null]
    );
    return response[0];
}

export async function editEnum(body: { id: string; value: string; enumTypeId: number; listPriority: number; payload: number; payloadTwo: string }) {
    const id = parseInt(body.id);
    const value = body.value;
    const enumTypeId = body.enumTypeId;
    const listPriority = body.listPriority;
    const payload = body.payload;
    const payloadTwo = body.payloadTwo;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            enums
        SET
            enum_type_id = ?,
            value = ?,
            list_priority = ?,
            payload = ?,
            payload_two = ?
        WHERE
            id = ?;`,
        [enumTypeId, value, listPriority, enumTypeId === 1 ? payload : null, enumTypeId === 1 ? payloadTwo : null, id]
    );
    return response[0];
}

export async function deleteEnum(body: { id: string }) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            enums
        WHERE
            id = ?;`,
        [body.id]
    );
    return response[0];
}


