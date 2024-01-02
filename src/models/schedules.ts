import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { Frequency, InitialStatus } from '../types/jobs';
import { ScheduleDates, TemplateId } from '../types/PMs';

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

export async function getScheduleDates(id: number, forInsert?: boolean) {
    const frequency: [Frequency[], FieldPacket[]] = await db.execute(
        `SELECT
            schedule_templates.frequency_time,
            schedule_templates.frequency_unit
        FROM
            schedules
        INNER JOIN schedule_templates ON
            schedule_templates.id = schedules.template_id
        WHERE
            schedules.id = ?
        LIMIT 1;`,
        [id]
    );

    const time = frequency[0][0].frequency_time;
    const unit = frequency[0][0].frequency_unit;

    let sql: string;
    if (forInsert) {
        sql = `
            SELECT
                DATE_ADD(schedules.required_comp_date, INTERVAL ${time} ${unit}) AS 'current_schedule',
                DATE_ADD(NOW(), INTERVAL ${time} ${unit}) AS 'new_schedule'`;
    } else {
        sql = `
            SELECT
                DATE_FORMAT(DATE_ADD(schedules.required_comp_date, INTERVAL ${time} ${unit}), "%d/%m/%y") AS 'current_schedule',
                DATE_FORMAT(DATE_ADD(NOW(), INTERVAL ${time} ${unit}), "%d/%m/%y") AS 'new_schedule'`;
    }

    sql += `
        FROM
            schedules
        WHERE
            schedules.id = ?;`;

    const data: [ScheduleDates[], FieldPacket[]] = await db.execute(sql, [id]);
    return data[0];
}

export async function getTemplateId(PMId: number) {
    const data: [TemplateId[], FieldPacket[]] = await db.execute(
        `SELECT
            template_id
        FROM
            schedules
        WHERE
            id = ?
        LIMIT
            1;`,
        [PMId]
    );
    return data[0][0].template_id;
}

export async function getPMScheduleForEdit(id: number) {
    const data = await db.execute(
        `SELECT
            type,
            title,
            description,
            frequency_time,
            frequency_unit
        FROM
            schedule_templates
        WHERE
            id = ?;`,
        [id]
    )
    return data[0];
}

export async function getPMforEdit(id: number) {
    const data = await db.execute(
        `SELECT
            status,
            notes
        FROM
            schedules
        WHERE
            schedules.id = ?;`,
        [id]
    );
    return data[0];
}

export async function addPM(templateId: number, required_comp_date: string) {
    const initialStatus: [InitialStatus[], FieldPacket[]] = await db.execute("SELECT id FROM status_types WHERE initial_status = '1' LIMIT 1");
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO schedules (
            template_id,
            created,
            required_comp_date,
            status
        )
        VALUES
            (?, NOW(), ?, ?);`,
        [templateId, required_comp_date, initialStatus[0][0].id]
    );
    return data[0];
}

export async function editPM(body: any, completed: boolean, logged_time: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            schedules
        SET
            notes = ?,
            completed = ?,
            comp_date = ${completed ? 'NOW()' : null},
            logged_time = ?,
            status = ?
        WHERE
            id = ?;`,
        [body.notes, completed, logged_time, body.status, body.id]
    );
    return data[0];
}

export async function editPMdue(templateId: number, dueDate: string) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            schedules
        SET
           required_comp_date = ? 
        WHERE
            template_id = ?
            AND
            completed = 0;`,
        [dueDate, templateId]
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

export async function editScheduleTemplate(body: any) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            schedule_templates
        SET
            type = ?,
            title = ?,
            description = ?,
            frequency_time = ?,
            frequency_unit = ?
        WHERE
            id = ?;`,
        [body.type, body.title, body.description, body.frequencyTime, body.frequencyUnit, body.id]
    );
    return data[0];
}