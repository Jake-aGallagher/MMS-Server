import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { AddField, EditField, FieldValue, GetFields } from '../types/customFields';
import { getFieldFileData } from './files';
import { getEnumsByGroupIds } from './enums';
import { enumObjForSelect } from '../helpers/enums/enumObjForSelect';
import { FileTypes } from '../helpers/constants';
import { isInteger } from '../helpers/isInteger';

export async function getCustomFieldData(model: string, modelId: number, modelTypeId?: number) {
    const fields = await getFieldsForRecord(model, modelId, modelTypeId);
    const enumGroupIds: number[] = fields.flatMap((field: FieldValue) => (field.enumGroupId !== null && field.enumGroupId > 0 ? field.enumGroupId : []));
    let enumGroups = {};
    if (enumGroupIds.length > 0) {
        const enumGroupsRaw = await getEnumsByGroupIds(enumGroupIds);
        if (enumGroupsRaw.length > 0) {
            enumGroups = enumObjForSelect(enumGroupsRaw);
        }
    }
    const fileIds = fields.flatMap((field: FieldValue) => (FileTypes.includes(field.type) && field.value?.length > 0 ? field.value.split(',') : []));
    const fileIdToFieldIdMap: { [key: string]: number } = {};
    fields.forEach((field: FieldValue) => {
        if (FileTypes.includes(field.type) && field.value?.length > 0) {
            field.value.split(',').forEach((value: string) => {
                fileIdToFieldIdMap[value] = field.id;
            });
        }
    });
    let fileData: { [key: string]: { id: string; encodedId: string; name: string }[] } = {};
    if (fileIds.length > 0) {
        fileData = await getFieldFileData(fileIds, fileIdToFieldIdMap);
    }
    return { fields, enumGroups, fileData };
}

export async function updateFieldData(modelId: number, fieldData: { [key: string]: string | number | boolean | undefined }) {
    const fieldKeys = Object.keys(fieldData).filter((key) => isInteger(key));
    const valuesString = fieldKeys
        .map((fieldKey) => {
            const data = fieldData[fieldKey];
            if (typeof data === 'string') {
                return `(${fieldKey}, ${modelId}, ${db.escape(data)})`;
            } else if (typeof data === 'number' || typeof data === 'boolean') {
                return `(${fieldKey}, ${modelId}, ${data})`;
            }
            return `(${fieldKey}, ${modelId}, '')`;
        })
        .join(',');

    const sql = db.format(
        `INSERT INTO field_values (
            field_id,
            model_id,
            value
        ) VALUES
        ${valuesString}
        ON DUPLICATE KEY UPDATE
            value = VALUES(value);`
    );

    if (valuesString.length === 0) {
        return { affectedRows: 0 };
    } else {
        const data: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
        return data[0];
    }
}

export async function getFieldsForRecord(model: string, modelId: number, modelTypeId?: number) {
    let sql = `
        SELECT
            fields.id,
            fields.model_id,
            fields.type,
            fields.enum_group_id AS enumGroupId,
            fields.field_name AS name,
            fields.required,
            fields.sort_order,
            field_values.value
        FROM
            fields
        LEFT JOIN
            field_values
        ON
            fields.id = field_values.field_id
        AND
            field_values.model_id = ?
        WHERE
            fields.model = ?
        ${modelTypeId ? ' AND fields.model_id = ? ' : ''}
        AND
            fields.deleted = 0
        ORDER BY
            fields.sort_order;`;

    let sqlParams = [modelId, model];
    if (modelTypeId) {
        sqlParams.push(modelTypeId);
    }

    const data: [FieldValue[], FieldPacket[]] = await db.execute(sql, sqlParams);
    return data[0];
}

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
            model_id,
            type,
            enum_group_id,
            field_name,
            required,
            sort_order,
            created
        )
        VALUES
            (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [field.model, field.modelId ? field.modelId : null, field.type, field.enumGroupId, field.name, field.required, field.order]
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
