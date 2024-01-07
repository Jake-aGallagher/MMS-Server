import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { Frequency, InitialStatus } from '../types/jobs';
import { ScheduleDates, TemplateId } from '../types/PMs';

export async function getScheduleTemplates(propertyId: number, templateId?: number) {
    let sql = `
        SELECT 
            pm_schedules.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
            typeEnum.value AS type,
            pm_schedules.title,
            pm_schedules.description,
            DATE_FORMAT(pm_schedules.created, "%d/%m/%y") AS 'created',
            CONCAT(
                pm_schedules.frequency_time,
                ' ',
                CASE
                    WHEN pm_schedules.frequency_unit = 'DAY' THEN 'Day(s)'
                    WHEN pm_schedules.frequency_unit = 'WEEK' THEN 'Week(s)'
                    WHEN pm_schedules.frequency_unit = 'MONTH' THEN 'Month(s)'
                    WHEN pm_schedules.frequency_unit = 'YEAR' THEN 'Year(s)'
                END
            ) AS frequency,
            MAX(DATE_FORMAT(schedules.comp_date, "%d/%m/%y")) AS 'last_comp_date',
            MAX(DATE_FORMAT(schedules.required_comp_date, "%d/%m/%y")) AS 'next_due_date',
            CONVERT(IF (MAX(schedules.required_comp_date) > CURDATE(), '1', '0'), UNSIGNED) AS 'up_to_date'
        FROM 
            pm_schedules
        LEFT JOIN schedules ON
            schedules.template_id = pm_schedules.id
        LEFT JOIN assets ON
            assets.id = pm_schedules.asset_id
        LEFT JOIN job_types AS typeEnum ON
            pm_schedules.type = typeEnum.id
        WHERE
            pm_schedules.property_id = ?
        `;

    if (templateId) {
        sql += `
            AND
                pm_schedules.id = ?`;
    }

    sql += `
        AND
            pm_schedules.deleted = 0
        GROUP BY
            pm_schedules.id
        ORDER BY
            pm_schedules.id
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
        INNER JOIN pm_schedules AS template ON
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
            pm_schedules.frequency_time,
            pm_schedules.frequency_unit
        FROM
            schedules
        INNER JOIN pm_schedules ON
            pm_schedules.id = schedules.template_id
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
            pm_schedules
        WHERE
            id = ?;`,
        [id]
    );
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
            (?, NOW(), ${required_comp_date}, ?);`,
        [templateId, initialStatus[0][0].id]
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
        `INSERT INTO pm_schedules (
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
            pm_schedules
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

export async function deleteScheduleTemplate(id: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE pm_schedules SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return data[0];
}
