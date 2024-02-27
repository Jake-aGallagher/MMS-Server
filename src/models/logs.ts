import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { AllLogs, Log, LogDates, LogFieldValues, LogForEdit, LogTemplate, LogTemplateFields, LogTemplateId, LogTemplateTitle } from '../types/logs';
import { isInteger } from '../helpers/isInteger';
import { Frequency } from '../types/jobs';

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
            ) AS frequency,
            MAX(DATE_FORMAT(logs.comp_date, "%d/%m/%y")) AS 'last_comp_date',
            MAX(DATE_FORMAT(logs.required_comp_date, "%d/%m/%y")) AS 'next_due_date',
            CONVERT(IF (MAX(logs.required_comp_date) > CURDATE(), '1', '0'), UNSIGNED) AS 'up_to_date'
        FROM 
            log_templates
        LEFT JOIN logs ON
            logs.template_id = log_templates.id
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

    let sqlArr = [propertyId];
    if (LogId) {
        sqlArr.push(LogId);
    }

    const data: [LogTemplate[], FieldPacket[]] = await db.execute(sql, sqlArr);
    return data[0];
}

export async function getLogTemplateTitle(id: number, logOrTemplate?: string) {
    const data: [LogTemplateTitle[], FieldPacket[]] = await db.execute(
        `SELECT
            log_templates.title,
            log_templates.description
        FROM
            log_templates
    ${logOrTemplate === 'log' ? `
        INNER JOIN logs ON
            logs.template_id = log_templates.id
        WHERE
            logs.id = ?`
    : 
        `WHERE
            log_templates.id = ?`
    }`,
        [id]
    );
    return data[0][0];
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

export async function getTemplateOfLog(logId: number) {
    const data: [LogForEdit[], FieldPacket[]] = await db.execute(
        `SELECT
            log_templates.id,
            log_templates.title,
            log_templates.description,
            log_templates.frequency_time,
            log_templates.frequency_unit
        FROM
            log_templates
        INNER JOIN logs ON
            logs.template_id = log_templates.id
        WHERE
            logs.id = ?`,
        [logId]
    );
    return data[0][0];
}

export async function getTemplateId(logId: number) {
    const data: [LogTemplateId[], FieldPacket[]] = await db.execute(
        `SELECT
            template_id
        FROM
            logs
        WHERE
            id = ?
        LIMIT
            1;`,
        [logId]
    );
    return data[0][0].template_id;
}

export async function getLogDates(id: number, forInsert?: boolean) {
    const frequency: [Frequency[], FieldPacket[]] = await db.execute(
        `SELECT
            log_templates.frequency_time,
            log_templates.frequency_unit
        FROM
            logs
        INNER JOIN log_templates ON
            log_templates.id = logs.template_id
        WHERE
            logs.id = ?
        LIMIT 1;`,
        [id]
    );

    const time = frequency[0][0].frequency_time;
    const unit = frequency[0][0].frequency_unit;

    let sql = `
        SELECT
            DATE_FORMAT(DATE_ADD(logs.required_comp_date, INTERVAL ${time} ${unit}), "${forInsert ? '%Y-%m-%d' : '%d/%m/%y'}" ) AS 'current_schedule',
            DATE_FORMAT(DATE_ADD(NOW(), INTERVAL ${time} ${unit}), "${forInsert ? '%Y-%m-%d' : '%d/%m/%y'}") AS 'new_schedule'
        FROM
            logs
        WHERE
            logs.id = ?;`;

    const data: [LogDates[], FieldPacket[]] = await db.execute(sql, [id]);
    return data[0];
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

// Logs

export async function getLogs(propertyId: number, incompleteOnly?: boolean) {
    const data: [AllLogs[], FieldPacket[]] = await db.execute(
        `SELECT
            logs.id,
            log_templates.title,
            DATE_FORMAT(logs.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(logs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            logs.completed,
            DATE_FORMAT(logs.comp_date, "%d/%m/%y") AS 'comp_date',
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
            logs
        INNER JOIN
            log_templates
        ON
            log_templates.id = logs.template_id
        WHERE
            logs.property_id = ?
        
        ${incompleteOnly ? 'AND logs.completed = 0' : ''}
        
        GROUP BY
            logs.id
        ORDER BY
            logs.id
        DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getLogsByTemplate(templateId: number) {
    const data = await db.execute(
        `SELECT
            logs.id,
            DATE_FORMAT(logs.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(logs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            logs.completed,
            DATE_FORMAT(logs.comp_date, "%d/%m/%y") AS 'comp_date'
        FROM
            logs
        WHERE
            template_id = ?;`,
        [templateId]
    );
    return data[0];
}

export async function getLog(logId: number) {
    const data: [Log[], FieldPacket[]] = await db.execute(
        `SELECT
            logs.id,
            log_templates.title,
            log_templates.description,
            DATE_FORMAT(logs.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(logs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            logs.completed,
            logs.comp_date,
            CONCAT(users.first_name, ' ', users.last_name) AS completed_by,
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
            logs
        INNER JOIN log_templates ON
            log_templates.id = logs.template_id
        LEFT JOIN users ON
            logs.completed_by = users.id
        WHERE
            logs.id = ?;`,
        [logId]
    );

    const fields: [LogFieldValues[], FieldPacket[]] = await db.execute(
        `SELECT
            log_fields.id,
            log_fields.field_name AS name,
            log_fields.type,
            log_fields.enum_group_id AS enumGroupId,
            log_field_values.value
        FROM
            log_fields
        INNER JOIN logs ON
            log_fields.template_id = logs.template_id
        LEFT JOIN log_field_values ON
            log_field_values.log_id = logs.id
            AND
            log_field_values.field_id = log_fields.id
        WHERE
            logs.id = ?
        ORDER BY
            log_fields.sort_order;`,
        [logId]
    );
    return { log: data[0][0], fields: fields[0] };
}

export async function addLog(templateId: number, propertyId: number, req_comp_date: string) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO logs (
            template_id,
            property_id,
            created,
            required_comp_date
        ) VALUES (?, ?, NOW(), ${req_comp_date})`,
        [templateId, propertyId]
    );
    return data[0];
}

export async function updateLog(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE logs SET
            completed = ?,
            comp_date = ${body.fieldData.completed ? 'NOW()' : 'NULL'},
            completed_by = ${body.fieldData.completed ? body.completedBy : 'NULL'}
        WHERE
            id = ?`,
        [body.fieldData.completed, body.logId]
    );
    return data[0];
}

// Fields

export async function getLogFields(logId: number) {
    const data: [LogFieldValues[], FieldPacket[]] = await db.execute(
        `SELECT
            log_fields.id,
            log_fields.field_name AS name,
            log_fields.type,
            log_fields.enum_group_id AS enumGroupId,
            log_fields.required,
            log_field_values.value
        FROM
            log_fields
        INNER JOIN logs ON
            log_fields.template_id = logs.template_id
        LEFT JOIN log_field_values ON
            log_field_values.log_id = logs.id
            AND
            log_field_values.field_id = log_fields.id
        WHERE
            logs.id = ?
        ORDER BY
            log_fields.sort_order;`,
        [logId]
    );
    return data[0];
}

export async function getLogFieldsPreview(logTemplateId: number) {
    const data: [LogTemplateFields[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            type,
            enum_group_id AS enumGroupId,
            field_name AS name,
            IF(required = 1, true, false) AS required,
            sort_order
        FROM
            log_fields
        WHERE
            log_fields.template_id = ?
            AND
            deleted = 0
        ORDER BY
            log_fields.sort_order`,
        [logTemplateId]
    );
    return data[0];
}

export async function getLogFieldForEdit(id: number) {
    const data: [LogTemplateFields[], FieldPacket[]] = await db.execute(
        `SELECT
            type,
            field_name AS name,
            required,
            sort_order
        FROM
            log_fields
        WHERE
            log_fields.id = ?`,
        [id]
    );
    return data[0][0];
}

export async function addLogField(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO log_fields (
            template_id,
            type,
            enum_group_id,
            field_name,
            field_label,
            required,
            sort_order,
            created
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [body.templateId, body.type, body.enumGroupId ? body.enumGroupId : null, body.name, body.name.replace(/ /g, '_'), body.required, body.order]
    );
    return data[0];
}

export async function editLogField(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE log_fields SET
            type = ?,
            field_name = ?,
            required = ?,
            sort_order = ?
        WHERE
            id = ?`,
        [body.type, body.name, body.required, body.order, body.id]
    );
    return data[0];
}

export async function updateFieldData(logId: number, fieldData: { [key: string]: string | number | boolean | undefined }) {
    const fieldKeys = Object.keys(fieldData).filter((key) => isInteger(key));
    const valuesString = fieldKeys.map((fieldKey) => `(${logId}, ${fieldKey}, '${fieldData[fieldKey] ? fieldData[fieldKey] : ''}')`).join(',');

    const sql = `
        INSERT INTO log_field_values (
            log_id,
            field_id,
            value
        ) VALUES
        ${valuesString}
        ON DUPLICATE KEY UPDATE
            value = VALUES(value);`;

    if (valuesString.length === 0) {
        return { affectedRows: 0 };
    } else {
        const data: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
        return data[0];
    }
}

export async function deleteLogField(id: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE log_fields SET deleted = '1', deleted_date = NOW() WHERE id = ?;`, [id]);
    return data[0];
}
