import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { InitialStatus } from '../types/jobs';

export async function getScheduleTemplates(propertyId: number, templateId?: number) {
    let sql = `
        SELECT 
            schedule_templates.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
            typeEnum.value AS type,
            schedule_templates.title,
            schedule_templates.description,
            DATE_FORMAT(schedule_templates.created, "%d/%m/%y") AS 'created',
            CONCAT(
                schedule_templates.frequency_time,
                ' ',
                CASE
                    WHEN schedule_templates.frequency_unit = 'DAY' THEN 'Day(s)'
                    WHEN schedule_templates.frequency_unit = 'WEEK' THEN 'Week(s)'
                    WHEN schedule_templates.frequency_unit = 'MONTH' THEN 'Month(s)'
                    WHEN schedule_templates.frequency_unit = 'YEAR' THEN 'Year(s)'
                END
            ) AS frequency,
            MAX(DATE_FORMAT(schedules.comp_date, "%d/%m/%y")) AS 'last_comp_date',
            MAX(DATE_FORMAT(schedules.required_comp_date, "%d/%m/%y")) AS 'next_due_date',
            CONVERT(IF (MAX(schedules.required_comp_date) > CURDATE(), '1', '0'), UNSIGNED) AS 'up_to_date'
        FROM 
            schedule_templates
        LEFT JOIN schedules ON
            schedules.template_id = schedule_templates.id
        LEFT JOIN assets ON
            assets.id = schedule_templates.asset_id
        LEFT JOIN job_types AS typeEnum ON
            schedule_templates.type = typeEnum.id
        WHERE
            schedule_templates.property_id = ?
        `;

    if (templateId) {
        sql += `
            AND
                schedule_templates.id = ?`;
    }

    sql += `
        AND
            schedule_templates.deleted = 0
        GROUP BY
            schedule_templates.id
        ORDER BY
            schedule_templates.id
        DESC;`;

    let sqlArr = [propertyId];
    if (templateId) {
        sqlArr.push(templateId);
    }

    const data = await db.execute(sql, sqlArr);
    return data[0];
}

export async function getSchedulePMs(templateId: number) {
    const data = await db.execute(
        `SELECT
            schedules.id,
            schedules.notes,
            DATE_FORMAT(schedules.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(schedules.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            schedules.completed,
            DATE_FORMAT(schedules.comp_date, "%d/%m/%y") AS 'comp_date',
            schedules.logged_time,
            status_types.value AS status
        FROM
            schedules
        LEFT JOIN status_types ON
            status_types.id = schedules.status
        WHERE
            template_id = ?;`,
        [templateId]
    );
    return data[0];
}

export async function getSchedulePMDetails(id: number) {
    const data = await db.execute(
        `SELECT
            schedules.id,
            template.id AS template_id,
            template.title,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
            typeEnum.value AS type,
            template.description,
            schedules.notes,
            DATE_FORMAT(schedules.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(schedules.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            status_types.value AS status,
            schedules.completed,
            DATE_FORMAT(schedules.comp_date, "%d/%m/%y") AS 'comp_date',
            schedules.logged_time
        FROM
            schedules
        INNER JOIN schedule_templates AS template ON
            template.id = schedules.template_id
        LEFT JOIN assets ON
            assets.id = template.asset_id
        LEFT JOIN job_types AS typeEnum ON
            template.type = typeEnum.id
        LEFT JOIN status_types ON
            status_types.id = schedules.status
        WHERE
            schedules.id = ?;`,
        [id]
    );
    return data[0];
}

export async function addSchedule(body: any) {
    const initialStatus: [InitialStatus[], FieldPacket[]] = await db.execute("SELECT id FROM status_types WHERE initial_status = '1' LIMIT 1");
    const dueDate = body.startNow === 'Yes' ? 'CURDATE()' : body.scheduleStart;
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO schedules (
            property_id,
            asset_id,
            type,
            title,
            description,
            created,
            required_comp_date,
            status,
            frequency_time,
            frequency_unit
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?);`,
        [body.propertyId, body.assetId, body.type, body.title, body.description, dueDate, initialStatus[0][0].id, body.frequencyTime, body.frequencyUnit]
    );
    return data[0];
}

export async function addScheduleTemplate(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO schedule_templates (
            property_id,
            asset_id,
            type,
            title,
            description,
            created,
            frequency_time,
            frequency_unit
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?);`,
        [body.propertyId, body.assetId, body.type, body.title, body.description, body.frequencyTime, body.frequencyUnit]
    );
    return data[0];
}
