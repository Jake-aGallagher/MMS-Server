import getConnection from '../../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { PMDetails, PMStatusNotesType, RecentPms, ScheduleDates, ScheduleId } from '../../types/maintenance/PMs';
import { Frequency, InitialStatus } from '../../types/maintenance/jobs';

// --------------- PMs ---------------

export async function getPMs(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            pms.id,
            pm_schedules.title,
            task_types.value AS 'type',
            DATE_FORMAT(pms.created, "%d/%m/%y") AS 'created',
            DATE_FORMAT(pms.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            status_types.value AS status,
            CONCAT(
                pm_schedules.frequency_time,
                ' ',
                CASE
                    WHEN pm_schedules.frequency_unit = 'DAY' THEN 'Day(s)'
                    WHEN pm_schedules.frequency_unit = 'WEEK' THEN 'Week(s)'
                    WHEN pm_schedules.frequency_unit = 'MONTH' THEN 'Month(s)'
                    WHEN pm_schedules.frequency_unit = 'YEAR' THEN 'Year(s)'
                END
            ) AS frequency
        FROM
            pms
        INNER JOIN pm_schedules ON
            pm_schedules.id = pms.schedule_id
        LEFT JOIN status_types ON
            status_types.id = pms.status
        LEFT JOIN task_types ON
            task_types.id = pm_schedules.type
        WHERE
            pm_schedules.facility_id = ?
        AND
            pms.completed = 0;`,
        [facilityId]
    );
    return data[0];
}

export async function getPMsBySchedule(client: string, scheduleId: number) {
    const db = await getConnection('client_' + client);
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

export async function getPMDetails(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data: [PMDetails[], FieldPacket[]] = await db.execute(
        `SELECT
            pms.id,
            pms.schedule_id AS schedule_id,
            pm_schedules.title,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
            pm_schedules.type AS type_id,
            task_types.value AS type,
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
        LEFT JOIN task_types AS task_types ON
            pm_schedules.type = task_types.id
        LEFT JOIN status_types ON
            status_types.id = pms.status
        WHERE
            pms.id = ?;`,
        [id]
    );
    return data[0];
}

export async function getRecentPmsForAsset(client: string, idsForAssets: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
        `SELECT
            pms.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            task_types.value AS type,
            pm_schedules.title,
            DATE_FORMAT(pms.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            pms.completed,
            CONCAT(
                pm_schedules.frequency_time,
                ' ',
                CASE
                    WHEN pm_schedules.frequency_unit = 'DAY' THEN 'Day(s)'
                    WHEN pm_schedules.frequency_unit = 'WEEK' THEN 'Week(s)'
                    WHEN pm_schedules.frequency_unit = 'MONTH' THEN 'Month(s)'
                    WHEN pm_schedules.frequency_unit = 'YEAR' THEN 'Year(s)'
                END
            ) AS frequency
        FROM
            pms
        INNER JOIN pm_schedules ON
            pm_schedules.id = pms.schedule_id
        LEFT JOIN assets ON
            assets.id = pm_schedules.asset_id
        LEFT JOIN task_types ON
            pm_schedules.type = task_types.id
        WHERE
            pm_schedules.asset_id IN (?)
        AND
            pm_schedules.deleted = 0 
        ORDER BY
            pms.created
        DESC
        LIMIT
            5;`,
        [idsForAssets]
    );
    const data: [RecentPms[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function getRecentPmsById(client: string, ids: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
        `SELECT
            pms.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            task_types.value AS type,
            pm_schedules.title,
            DATE_FORMAT(pms.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            pms.completed,
            CONCAT(
                pm_schedules.frequency_time,
                ' ',
                CASE
                    WHEN pm_schedules.frequency_unit = 'DAY' THEN 'Day(s)'
                    WHEN pm_schedules.frequency_unit = 'WEEK' THEN 'Week(s)'
                    WHEN pm_schedules.frequency_unit = 'MONTH' THEN 'Month(s)'
                    WHEN pm_schedules.frequency_unit = 'YEAR' THEN 'Year(s)'
                END
            ) AS frequency
        FROM
            pms
        INNER JOIN pm_schedules ON
            pm_schedules.id = pms.schedule_id
        LEFT JOIN assets ON
            assets.id = pm_schedules.asset_id
        LEFT JOIN task_types ON
            pm_schedules.type = task_types.id
        WHERE
            pms.id IN (?)
        AND
            pm_schedules.deleted = 0 
        ORDER BY
            pms.created
        DESC
        LIMIT
            5;`,
        [ids]
    );
    const data: [RecentPms[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function getPMforEdit(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data: [PMStatusNotesType[], FieldPacket[]] = await db.execute(
        `SELECT
            pms.status,
            pms.notes,
            pm_schedules.type AS type_id
        FROM
            pms
        INNER JOIN pm_schedules ON
            pm_schedules.id = pms.schedule_id
        WHERE
            pms.id = ?;`,
        [id]
    );
    return data[0];
}

export async function addPM(client: string, scheduleId: number, required_comp_date: string) {
    const db = await getConnection('client_' + client);
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

export async function editPM(client: string, body: any, completed: boolean, logged_time: number) {
    const db = await getConnection('client_' + client);
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

export async function editPMdueDate(client: string, scheduleId: number, dueDate: string) {
    const db = await getConnection('client_' + client);
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

// --------------- Schedules ---------------

export async function getPMSchedules(client: string, facilityId: number, scheduleId?: number) {
    const db = await getConnection('client_' + client);
    let sql = `
        SELECT 
            pm_schedules.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
            task_types.value AS type,
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
        LEFT JOIN task_types AS task_types ON
            pm_schedules.type = task_types.id
        WHERE
            pm_schedules.facility_id = ?
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

    let sqlArr = [facilityId];
    if (scheduleId) {
        sqlArr.push(scheduleId);
    }

    const data = await db.execute(sql, sqlArr);
    return data[0];
}

export async function getScheduleDates(client: string, id: number, forInsert?: boolean) {
    const db = await getConnection('client_' + client);
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

    let sql = `
        SELECT
            DATE_FORMAT(DATE_ADD(pms.required_comp_date, INTERVAL ${time} ${unit}), "${forInsert ? '%Y-%m-%d' : '%d/%m/%y'}" ) AS 'current_schedule',
            DATE_FORMAT(DATE_ADD(NOW(), INTERVAL ${time} ${unit}), "${forInsert ? '%Y-%m-%d' : '%d/%m/%y'}") AS 'new_schedule'
        FROM
            pms
        WHERE
            pms.id = ?;`;

    const data: [ScheduleDates[], FieldPacket[]] = await db.execute(sql, [id]);
    return data[0];
}

export async function getScheduleId(client: string, PMId: number) {
    const db = await getConnection('client_' + client);
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

export async function getPMScheduleForEdit(client: string, id: number) {
    const db = await getConnection('client_' + client);
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

export async function addPMSchedule(client: string, body: any) {
    const db = await getConnection('client_' + client);
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO pm_schedules (
            facility_id,
            asset_id,
            type,
            title,
            description,
            created,
            frequency_time,
            frequency_unit
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?);`,
        [body.facilityId, body.assetId, body.type, body.title, body.description, body.frequencyTime, body.frequencyUnit]
    );
    return data[0];
}

export async function editPMSchedule(client: string, body: any) {
    const db = await getConnection('client_' + client);
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

export async function deletePMSchedule(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE pm_schedules SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return data[0];
}

