import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { AddField, EditField, GetFields } from '../types/customFields';

export async function getFieldsForModel(model: string) {
    const data: [GetFields[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            type,
            enum_group_id,
            field_name AS name,
            required,
            sort_order
        FROM
            fields
        WHERE
            model = ?
        AND
            deleted = 0
        ORDER BY
            sort_order`,
        [model]
    );
    return data[0];
}

export async function getFieldById(id: number) {
    const data: [GetFields[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            type,
            enum_group_id,
            field_name AS name,
            required,
            sort_order
        FROM
            fields
        WHERE
            id = ?`,
        [id]
    );
    return data[0][0];
}

export async function addField(field: AddField) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO fields (
            model,
            type,
            enum_group_id,
            field_name,
            required,
            sort_order,
            created
        )
        VALUES
            (?, ?, ?, ?, ?, ?, NOW())`,
        [field.model, field.type, field.enumGroupId, field.name, field.required, field.order]
    );
    return data[0].insertId;
}

export async function editField(id: number, field: EditField) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            fields
        SET
            type = ?,
            enum_group_id = ?,
            field_name = ?,
            required = ?,
            sort_order = ?
        WHERE
            id = ?`,
        [field.type, field.enumGroupId, field.name, field.required, field.order, id]
    );
    return data[0].affectedRows;
}

export async function deleteField(id: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE fields SET deleted = 1, deleted_date = NOW() WHERE id = ?`, [id]);
    return data[0].affectedRows;
}
