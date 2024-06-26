import getConnection from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { EnumGroups, ValuesByGroupIds } from '../types/enums';

export async function getEnumGroups(client: string) {
    const db = await getConnection('client_' + client);
    const data: [EnumGroups[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            value
        FROM
            enum_groups
        WHERE
            deleted = 0
        ORDER BY
            id;`
    );
    return data[0];
}

export async function getEnumGroupById(client: string, groupId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            value
        FROM
            enum_groups
        WHERE
            deleted = 0
        AND
            id = ?;`,
        [groupId]
    );
    return data[0];
}

export async function getEnumsByGroupId(client: string, enumGroupId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            enum_values.id,
            enum_values.value,
            enum_values.list_priority
        FROM 
            enum_values
        WHERE
            enum_values.enum_group_id = ?
        AND
            enum_values.deleted = 0
        ORDER BY
            enum_values.list_priority;`,
        [enumGroupId]
    );
    return data[0];
}

export async function getEnumsByGroupIds(client: string, enumGroupIds: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
        `SELECT
            enum_values.enum_group_id,
            enum_values.id,
            enum_values.value,
            enum_values.list_priority
        FROM 
            enum_values
        WHERE
            enum_values.enum_group_id IN (?)
        AND
            enum_values.deleted = 0
        ORDER BY
            enum_values.list_priority;`,
        [enumGroupIds]
    );
    const data: [ValuesByGroupIds[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function getEnumValueById(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            *
        FROM 
            enum_values
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function addEnumGroup(client: string, body: { value: string }) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            enum_groups
            (
                value
            )
        VALUES
            (?);`,
        [body.value]
    );
    return response[0];
}

export async function editEnumGroup(client: string, body: { id: string; value: string }) {
    const db = await getConnection('client_' + client);
    const id = parseInt(body.id);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            enum_groups
        SET
            value = ?
        WHERE
            id = ?;`,
        [body.value, id]
    );
    return response[0];
}

export async function addEnumValue(client: string, body: { value: string; enumGroupId: number; listPriority: number }) {
    const db = await getConnection('client_' + client);
    const value = body.value;
    const enumGroupId = body.enumGroupId;
    const listPriority = body.listPriority;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            enum_values
            (
                enum_group_id,
                value,
                list_priority
            )
        VALUES
            (?,?,?);`,
        [enumGroupId, value, listPriority]
    );
    return response[0];
}

export async function editEnumValue(client: string, body: { id: string; value: string; enumGroupId: number; listPriority: number }) {
    const db = await getConnection('client_' + client);
    const id = parseInt(body.id);
    const value = body.value;
    const enumGroupId = body.enumGroupId;
    const listPriority = body.listPriority;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            enum_values
        SET
            enum_group_id = ?,
            value = ?,
            list_priority = ?
        WHERE
            id = ?;`,
        [enumGroupId, value, listPriority, id]
    );
    return response[0];
}

export async function deleteEnumGroup(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            enum_groups
        SET
            deleted = 1,
            deleted_date = NOW()
        WHERE
            id = ?;`,
        [id]
    );
    return response[0];
}

export async function deleteEnumValue(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            enum_values
        SET
            deleted = 1,
            deleted_date = NOW()
        WHERE
            id = ?;`,
        [id]
    );
    return response[0];
}

export async function deleteEnumValueByGroupId(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            enum_values
        SET
            deleted = 1,
            deleted_date = NOW()
        WHERE
            enum_group_id = ?;`,
        [id]
    );
    return response[0];
}
