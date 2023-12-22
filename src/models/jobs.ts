import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import {
    TimeDetails,
    UpdateNotes,
    UpdateAndComplete,
    PostJob,
    RecentJobs,
    InitialStatus,
    JobDetails,
    Frequency,
    IsScheduled,
    JobDetailsForReentry,
    PostScheduledJob,
} from '../types/jobs';
import { UrgObj } from '../types/enums';

export async function getAllJobs(propertyId: number) {
    const data = await db.execute(
        `SELECT 
                jobs.id,
                jobs.property_id,
                IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
                typeEnum.value AS type,
                jobs.title,
                DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
                IF (jobs.urgency > 0, urgencyEnum.value, 'Scheduled') AS urgency,
                DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
                jobs.completed,
                DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
                CONCAT(users.first_name, " ", users.last_name) AS reporter,
                statusEnum.value AS status,
                jobs.scheduled,
                jobs.frequency_time,
                jobs.frequency_unit
            FROM 
                jobs
            LEFT JOIN users ON
                users.id = jobs.reporter
            LEFT JOIN assets ON
                assets.id = jobs.asset
            LEFT JOIN urgency_types AS urgencyEnum ON
                jobs.urgency = urgencyEnum.id
            LEFT JOIN job_types AS typeEnum ON
                jobs.type = typeEnum.id
            LEFT JOIN status_types AS statusEnum ON
                jobs.status = statusEnum.id
            WHERE
                jobs.property_id = ?
            AND
                jobs.deleted = 0
            ORDER BY
                jobs.id
            DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getJobDetails(id: number) {
    const data: [JobDetails[], FieldPacket[]] = await db.execute(
        `SELECT 
            jobs.id,
            properties.name AS property_name,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            typeEnum.value AS type,
            jobs.title,
            jobs.description,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            urgencyEnum.value AS urgency,
            DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            jobs.completed,
            DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
            CONCAT(users.first_name, " ", users.last_name) AS reporter,
            jobs.logged_time,
            status AS status_id,
            statusEnum.value AS status,
            jobs.notes,
            jobs.scheduled,
            jobs.frequency_time,
            jobs.frequency_unit
        FROM 
            jobs
        LEFT JOIN users ON
            users.id = jobs.reporter
        LEFT JOIN properties ON
            properties.id = jobs.property_id
        LEFT JOIN assets ON
            assets.id = jobs.asset
        LEFT JOIN urgency_types AS urgencyEnum ON
            jobs.urgency = urgencyEnum.id
        LEFT JOIN job_types AS typeEnum ON
            jobs.type = typeEnum.id
        LEFT JOIN status_types AS statusEnum ON
            jobs.status = statusEnum.id
        WHERE
            jobs.id = ?
        AND
            jobs.deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function getScheduleDates(id: number) {
    const frequency: [Frequency[], FieldPacket[]] = await db.execute(`SELECT frequency_time, frequency_unit FROM jobs WHERE id = ? LIMIT 1;`, [id]);
    const time = frequency[0][0].frequency_time;
    const unit = frequency[0][0].frequency_unit;
    const data = await db.execute(
        `SELECT
            DATE_FORMAT(DATE_ADD(jobs.required_comp_date, INTERVAL ${time} ${unit}), "%d/%m/%y") AS 'current_schedule',
            DATE_FORMAT(DATE_ADD(NOW(), INTERVAL ${time} ${unit}), "%d/%m/%y") AS 'new_schedule'
        FROM
            jobs
        WHERE
            jobs.id = ?;`,
        [id]
    );
    return data[0];
}

export async function checkIfJobIsScheduled(id: number) {
    const data: [IsScheduled[], FieldPacket[]] = await db.execute(`SELECT scheduled FROM jobs WHERE id = ? LIMIT 1;`, [id]);
    return data[0];
}

export async function getScheduledJobForReentry(id: number) {
    const data: [JobDetailsForReentry[], FieldPacket[]] = await db.execute(
        `SELECT
            property_id,
            asset,
            type,
            title,
            description,
            DATE_FORMAT(required_comp_date, "%Y-%m-%d") AS required_comp_date,
            reporter,
            frequency_time,
            frequency_unit
        FROM
            jobs
        WHERE
            id = ?;`,
        [id]
    );
    return data[0];
}

export async function getRecentJobs(idsForAssets: number[]) {
    const data = await db.execute(
        `SELECT
            jobs.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            job_types.value AS type,
            jobs.title,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            jobs.completed
        FROM
            jobs
        LEFT JOIN assets ON
            assets.id = jobs.asset
        LEFT JOIN job_types ON
            jobs.type = job_types.id
        WHERE
            asset IN (${idsForAssets})
        AND
            jobs.deleted = 0 
        ORDER BY
            jobs.created
        DESC
        LIMIT
            5;`
    );
    return data[0];
}

export async function getRecentJobsByIds(ids: number[]) {
    const data: [RecentJobs[], FieldPacket[]] = await db.execute(
        `SELECT
            jobs.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            job_types.value AS type,
            jobs.title,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            jobs.completed
        FROM
            jobs
        LEFT JOIN assets ON
            assets.id = jobs.asset
        LEFT JOIN job_types ON
            jobs.type = job_types.id
        WHERE
            jobs.id IN (${ids})
        AND
            jobs.deleted = 0
        ORDER BY
            jobs.created DESC
        LIMIT
            5;`
    );
    return data[0];
}

export async function getLoggedTimeDetails(jobId: number) {
    const data: [TimeDetails[], FieldPacket[]] = await db.execute(
        `SELECT
            logged_time.user_id AS id,
            logged_time.time,
            concat(users.first_name, ' ', users.last_name) as 'name'
        FROM
            logged_time
        INNER JOIN users ON
        (
            logged_time.user_id = users.id
        )
        WHERE
            logged_time.job_id = ?;`,
        [jobId]
    );
    return data[0];
}

export async function postJob(body: PostJob, urgencyObj: UrgObj[]) {
    const property_id = body.propertyNumber;
    const asset = body.assetNumber;
    const type = body.type;
    const title = body.title;
    const description = body.description;
    const reporter = body.reporter;
    const urgency = body.urgency;
    const numOfUrg = parseInt(urgencyObj[0].number);
    const lengthOfUrg = urgencyObj[0].duration;
    const initialStatus: [InitialStatus[], FieldPacket[]] = await db.execute("SELECT id FROM status_types WHERE initial_status = '1' LIMIT 1");
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
                jobs
                (
                    property_id,
                    asset,
                    type,
                    title,
                    description,
                    created,
                    urgency,
                    required_comp_date,
                    reporter,
                    status
                )
            VALUES
                (?,?,?,?,?, NOW() ,?, DATE_ADD(NOW(), INTERVAL ${numOfUrg} ${lengthOfUrg}) ,?,?);`,
        [property_id, asset, type, title, description, urgency, reporter, initialStatus[0][0].id]
    );
    return response[0];
}

export async function postScheduledJob(body: PostScheduledJob) {
    const property_id = body.propertyNumber;
    const asset = body.assetNumber;
    const type = body.type;
    const title = body.title;
    const description = body.description;
    const reporter = body.reporter;
    const dueDate = body.startNow === 'Yes' ? 'CURDATE()' : body.scheduleStart;
    const initialStatus: [InitialStatus[], FieldPacket[]] = await db.execute("SELECT id FROM status_types WHERE initial_status = '1' LIMIT 1");

    console.log(dueDate);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
                jobs
                (
                    property_id,
                    asset,
                    type,
                    title,
                    description,
                    created,
                    urgency,
                    required_comp_date,
                    reporter,
                    status,
                    scheduled,
                    frequency_time,
                    frequency_unit
                )
            VALUES
                (?,?,?,?,?, NOW() , 0 , ${dueDate} ,?,?, 1 ,?,?);`,
        [property_id, asset, type, title, description, reporter, initialStatus[0][0].id, body.intervalFrequency, body.intervalTimeUnit]
    );
    return response[0];
}

export async function updateAndComplete(body: UpdateAndComplete, totalTime: number) {
    const id = body.id;
    const status = body.status;
    const description = body.description;
    const notes = body.notes;
    const logged_time = totalTime;
    const completed = body.complete ? 1 : 0;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            jobs
        SET
            status = ?,
            description = ?,
            notes = ?,
            logged_time = ?,
            completed = ?,
            comp_date = ${body.complete ? 'NOW()' : null}
        WHERE
            id = ?;`,
        [status, description, notes, logged_time, completed, id]
    );
    return response[0];
}

export async function setTimeDetails(details: [{ id: number; time: number }], jobId: number) {
    const res: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            logged_time
        WHERE
            job_id = ?;`,
        [jobId]
    );
    if (res) {
        let sql = `
            INSERT INTO
                logged_time
                (
                    user_id,
                    job_id,
                    time
                )
            VALUES`;

        let values = [];
        for (let i = 0; i < details.length; i++) {
            values.push(`(${details[i].id}, ${jobId}, ${details[i].time})`);
        }
        sql += values.join(',') + `;`;

        const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
        return response[0];
    }
}

export async function updateNotes(body: UpdateNotes) {
    const id = body.id;
    const notes = body.notes;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            jobs
        SET
            notes = ?
        WHERE
            id = ?;`,
        [notes, id]
    );
    return response[0];
}

export async function deleteJobs(idsForDelete: number[]) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE jobs SET deleted = 1, deleted_date = NOW() WHERE asset IN (${idsForDelete});`);
    return response[0];
}
