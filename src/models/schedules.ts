import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { Frequency, InitialStatus } from '../types/jobs';
import { ScheduleDates, ScheduleId } from '../types/PMs';

export async function getPMSchedules(propertyId: number, scheduleId?: number) {
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
            MAX(DATE_FORMAT(pms.comp_date, "%d/%m/%y")) AS 'last_comp_date',
            MAX(DATE_FORMAT(pms.required_comp_date, "%d/%m/%y")) AS 'next_due_date',
            CONVERT(IF (MAX(pms.required_comp_date) > CURDATE(), '1', '0'), UNSIGNED) AS 'up_to_date'
        FROM 
            pm_schedules
        LEFT JOIN pms ON
            pms.schedule_id = pm_schedules.id
        LEFT JOIN assets ON
            assets.id = pm_schedules.asset_id
        LEFT JOIN job_types AS typeEnum ON
            pm_schedules.type = typeEnum.id
        WHERE
            pm_schedules.property_id = ?
        `;

    if (scheduleId) {
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
    if (scheduleId) {
        sqlArr.push(scheduleId);
    }

    const data = await db.execute(sql, sqlArr);
    return data[0];
}

export async function getPMs(scheduleId: number) {
    const data = await db.execute(
        `SELECT
            pms.id,
            pms.notes,
            DATE_FORMAT(pms.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(pms.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            pms.completed,
            DATE_FORMAT(pms.comp_date, "%d/%m/%y") AS 'comp_date',
            pms.logged_time,
            status_types.value AS status
        FROM
            pms
        LEFT JOIN status_types ON
            status_types.id = pms.status
        WHERE
            schedule_id = ?;`,
        [scheduleId]
    );
    return data[0];
}

export async function getPMDetails(id: number) {
    const data = await db.execute(
        `SELECT
            pms.id,
            pms.schedule_id AS schedule_id,
            pm_schedules.title,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
            typeEnum.value AS type,
            pm_schedules.description,
            pms.notes,
            DATE_FORMAT(pms.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(pms.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            status_types.value AS status,
            pms.completed,
            DATE_FORMAT(pms.comp_date, "%d/%m/%y") AS 'comp_date',
            pms.logged_time
        FROM
            pms
        INNER JOIN pm_schedules ON
            pm_schedules.id = pms.schedule_id
        LEFT JOIN assets ON
            assets.id = pm_schedules.asset_id
        LEFT JOIN job_types AS typeEnum ON
            pm_schedules.type = typeEnum.id
        LEFT JOIN status_types ON
            status_types.id = pms.status
        WHERE
            pms.id = ?;`,
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
            pms
        INNER JOIN pm_schedules ON
            pm_schedules.id = pms.schedule_id
        WHERE
            pms.id = ?
        LIMIT 1;`,
        [id]
    );

    const time = frequency[0][0].frequency_time;
    const unit = frequency[0][0].frequency_unit;

    let sql: string;
    if (forInsert) {
        sql = `
            SELECT
                DATE_ADD(pms.required_comp_date, INTERVAL ${time} ${unit}) AS 'current_schedule',
                DATE_ADD(NOW(), INTERVAL ${time} ${unit}) AS 'new_schedule'`;
    } else {
        sql = `
            SELECT
                DATE_FORMAT(DATE_ADD(pms.required_comp_date, INTERVAL ${time} ${unit}), "%d/%m/%y") AS 'current_schedule',
                DATE_FORMAT(DATE_ADD(NOW(), INTERVAL ${time} ${unit}), "%d/%m/%y") AS 'new_schedule'`;
    }

    sql += `
        FROM
            pms
        WHERE
            pms.id = ?;`;

    const data: [ScheduleDates[], FieldPacket[]] = await db.execute(sql, [id]);
    return data[0];
}

export async function getScheduleId(PMId: number) {
    const data: [ScheduleId[], FieldPacket[]] = await db.execute(
        `SELECT
            schedule_id
        FROM
            pms
        WHERE
            id = ?
        LIMIT
            1;`,
        [PMId]
    );
    return data[0][0].schedule_id;
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
            pms
        WHERE
            pms.id = ?;`,
        [id]
    );
    return data[0];
}

export async function addPM(scheduleId: number, required_comp_date: string) {
    const initialStatus: [InitialStatus[], FieldPacket[]] = await db.execute("SELECT id FROM status_types WHERE initial_status = '1' LIMIT 1");
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO pms (
            schedule_id,
            created,
            required_comp_date,
            status
        )
        VALUES
            (?, NOW(), ${required_comp_date}, ?);`,
        [scheduleId, initialStatus[0][0].id]
    );
    return data[0];
}

export async function editPM(body: any, completed: boolean, logged_time: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            pms
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

export async function editPMdueDate(scheduleId: number, dueDate: string) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            pms
        SET
           required_comp_date = ? 
        WHERE
            schedule_id = ?
            AND
            completed = 0;`,
        [dueDate, scheduleId]
    );
    return data[0];
}

export async function addPMSchedule(body: any) {
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

export async function editPMSchedule(body: any) {
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

export async function deletePMSchedule(id: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE pm_schedules SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return data[0];
}
