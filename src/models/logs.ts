import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { LogForEdit, LogTemplate, LogTemplateFields } from '../types/logs';

// Templates

export async function getLogTemplates(propertyId: number, LogId?: number) {
    let sql = `
        SELECT 
            log_templates.id,
            log_templates.title,
            log_templates.description,
            DATE_FORMAT(log_templates.created, "%d/%m/%y") AS 'created',
            CONCAT(
                log_templates.frequency_time,
                ' ',
                CASE
                    WHEN log_templates.frequency_unit = 'DAY' THEN 'Day(s)'
                    WHEN log_templates.frequency_unit = 'WEEK' THEN 'Week(s)'
                    WHEN log_templates.frequency_unit = 'MONTH' THEN 'Month(s)'
                    WHEN log_templates.frequency_unit = 'YEAR' THEN 'Year(s)'
                END
            ) AS frequency
        FROM 
            log_templates
        WHERE
            log_templates.property_id = ?
        `;

    if (LogId) {
        sql += `
            AND
                log_templates.id = ?`;
    }

    sql += `
        AND
            log_templates.deleted = 0
        GROUP BY
            log_templates.id
        ORDER BY
            log_templates.id
        DESC;`;

    /* MAX(DATE_FORMAT(pms.comp_date, "%d/%m/%y")) AS 'last_comp_date',
    MAX(DATE_FORMAT(pms.required_comp_date, "%d/%m/%y")) AS 'next_due_date',
    CONVERT(IF (MAX(pms.required_comp_date) > CURDATE(), '1', '0'), UNSIGNED) AS 'up_to_date' */

    let sqlArr = [propertyId];
    if (LogId) {
        sqlArr.push(LogId);
    }

    const data: [LogTemplate[], FieldPacket[]] = await db.execute(sql, sqlArr);
    return data[0];
}

export async function getLogTemplateForEdit(logTemplateId: number) {
    const data: [LogForEdit[], FieldPacket[]] = await db.execute(
        `SELECT
            log_templates.id,
            log_templates.title,
            log_templates.description,
            log_templates.frequency_time,
            log_templates.frequency_unit
        FROM
            log_templates
        WHERE
            log_templates.id = ?`,
        [logTemplateId]
    );
    return data[0][0];
}

export async function addLogTemplate(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO log_templates (
            property_id,
            title,
            description,
            frequency_time,
            frequency_unit,
            created
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [body.propertyId, body.title, body.description, body.frequencyTime, body.frequencyUnit]
    );
    return data[0];
}

export async function editLogTemplate(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE log_templates SET
            title = ?,
            description = ?,
            frequency_time = ?,
            frequency_unit = ?
        WHERE
            id = ?`,
        [body.title, body.description, body.frequencyTime, body.frequencyUnit, body.id]
    );
    return data[0];
}

export async function deleteLogTemplate(id: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE log_templates SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return data[0];
}

// Fields

export async function getLogFields(logTemplateId: number) {
    const data: [LogTemplateFields[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            type,
            field_name AS name,
            required,
            guidance,
            sort_order
        FROM
            log_fields
        WHERE
            log_fields.template_id = ?
        ORDER BY
            log_fields.sort_order`,
        [logTemplateId]
    );
    return data[0];

}

export async function addLogField(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO log_fields (
            template_id,
            type,
            field_name,
            required,
            guidance,
            sort_order,
            created
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [body.templateId, body.type, body.name, body.required, body.guidance, body.order]
    );
    return data[0];
}

export async function editLogField(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE log_fields SET
            type = ?,
            field_name = ?,
            required = ?,
            guidance = ?,
            sort_order = ?
        WHERE
            id = ?`,
        [body.type, body.name, body.required, body.guidance, body.order, body.id]
    );
    return data[0];
}