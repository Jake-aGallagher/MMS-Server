import db from '../database/database';
//import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';

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
