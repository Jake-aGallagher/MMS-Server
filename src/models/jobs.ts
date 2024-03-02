import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import {
    UpdateNotes,
    UpdateAndComplete,
    PostJob,
    RecentJobs,
    InitialStatus,
    JobDetails,
} from '../types/jobs';
import { UrgObj } from '../types/enums';

export async function getAllJobs(propertyId: number) {
    const data = await db.execute(
        `SELECT 
                jobs.id,
                jobs.property_id,
                IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
                task_types.value AS type,
                jobs.title,
                DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
                IF (jobs.urgency > 0, urgencyEnum.value, 'Scheduled') AS urgency,
                DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
                jobs.completed,
                DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
                CONCAT(users.first_name, " ", users.last_name) AS reported_by,
                statusEnum.value AS status
            FROM 
                jobs
            LEFT JOIN users ON
                users.id = jobs.reported_by
            LEFT JOIN assets ON
                assets.id = jobs.asset
            LEFT JOIN urgency_types AS urgencyEnum ON
                jobs.urgency = urgencyEnum.id
            LEFT JOIN task_types AS task_types ON
                jobs.type = task_types.id
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
            jobs.type AS type_id,
            task_types.value AS type,
            jobs.title,
            jobs.description,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            urgencyEnum.value AS urgency,
            DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            jobs.completed,
            DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
            CONCAT(users.first_name, " ", users.last_name) AS reported_by,
            jobs.logged_time,
            status AS status_id,
            statusEnum.value AS status,
            jobs.notes
        FROM 
            jobs
        LEFT JOIN users ON
            users.id = jobs.reported_by
        LEFT JOIN properties ON
            properties.id = jobs.property_id
        LEFT JOIN assets ON
            assets.id = jobs.asset
        LEFT JOIN urgency_types AS urgencyEnum ON
            jobs.urgency = urgencyEnum.id
        LEFT JOIN task_types AS task_types ON
            jobs.type = task_types.id
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

export async function getRecentJobs(idsForAssets: number[]) {
    const data = await db.execute(
        `SELECT
            jobs.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            task_types.value AS type,
            jobs.title,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            jobs.completed
        FROM
            jobs
        LEFT JOIN assets ON
            assets.id = jobs.asset
        LEFT JOIN task_types ON
            jobs.type = task_types.id
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
            task_types.value AS type,
            jobs.title,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            jobs.completed
        FROM
            jobs
        LEFT JOIN assets ON
            assets.id = jobs.asset
        LEFT JOIN task_types ON
            jobs.type = task_types.id
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

export async function postJob(body: PostJob, urgencyObj: UrgObj[]) {
    const property_id = body.propertyNumber;
    const asset = body.assetNumber;
    const type = body.type;
    const title = body.title;
    const description = body.description;
    const reported_by = body.reported_by;
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
                    reported_by,
                    status
                )
            VALUES
                (?,?,?,?,?, NOW() ,?, DATE_ADD(NOW(), INTERVAL ${numOfUrg} ${lengthOfUrg}) ,?,?);`,
        [property_id, asset, type, title, description, urgency, reported_by, initialStatus[0][0].id]
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
