import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../database/database';
import { InitialStatus } from '../types/jobs';

export async function getAllSchedules(propertyId: number) {
    const data = await db.execute(
        `SELECT 
                schedules.id,
                IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
                typeEnum.value AS type,
                schedules.title,
                DATE_FORMAT(schedules.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
                schedules.completed,
                DATE_FORMAT(schedules.comp_date, "%d/%m/%y") AS 'comp_date',
                statusEnum.value AS status,
                CONCAT(
                    schedules.frequency_time,
                    ' ',
                    CASE
                        WHEN schedules.frequency_unit = 'DAY' THEN 'Day(s)'
                        WHEN schedules.frequency_unit = 'WEEK' THEN 'Week(s)'
                        WHEN schedules.frequency_unit = 'MONTH' THEN 'Month(s)'
                        WHEN schedules.frequency_unit = 'YEAR' THEN 'Year(s)'
                    END
                ) AS frequency
            FROM 
                schedules
            LEFT JOIN assets ON
                assets.id = schedules.asset_id
            LEFT JOIN job_types AS typeEnum ON
                schedules.type = typeEnum.id
            LEFT JOIN status_types AS statusEnum ON
                schedules.status = statusEnum.id
            WHERE
                schedules.property_id = ?
            AND
                schedules.deleted = 0
            ORDER BY
                schedules.id
            DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getScheduleDetails(scheduleId: number) {
    const data = await db.execute(
        `SELECT 
                schedules.id,
                properties.name AS property,
                IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset,
                typeEnum.value AS type,
                schedules.title,
                schedules.description,
                schedules.notes,
                DATE_FORMAT(schedules.created, "%d/%m/%y") AS 'created',
                DATE_FORMAT(schedules.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
                schedules.completed,
                DATE_FORMAT(schedules.comp_date, "%d/%m/%y") AS 'comp_date',
                schedules.logged_time,
                statusEnum.value AS status,
                CONCAT(
                    schedules.frequency_time,
                    ' ',
                    CASE
                        WHEN schedules.frequency_unit = 'DAY' THEN 'Day(s)'
                        WHEN schedules.frequency_unit = 'WEEK' THEN 'Week(s)'
                        WHEN schedules.frequency_unit = 'MONTH' THEN 'Month(s)'
                        WHEN schedules.frequency_unit = 'YEAR' THEN 'Year(s)'
                    END
                ) AS frequency
            FROM 
                schedules
            LEFT JOIN assets ON
                assets.id = schedules.asset_id
            LEFT JOIN job_types AS typeEnum ON
                schedules.type = typeEnum.id
            LEFT JOIN status_types AS statusEnum ON
                schedules.status = statusEnum.id
            LEFT JOIN properties ON
                properties.id = schedules.property_id
            WHERE
                schedules.id = ?
            AND
                schedules.deleted = 0;`,
        [scheduleId]
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
        [
            body.propertyId,
            body.assetId,
            body.type,
            body.title,
            body.description,
            dueDate,
            initialStatus[0][0].id,
            body.frequencyTime,
            body.frequencyUnit,
        ]
    );
    return data[0];
}
