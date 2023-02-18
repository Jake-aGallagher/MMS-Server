import db from '../database/database';
import { FieldPacket, RowDataPacket } from 'mysql2/typings/mysql';

export async function getAllJobs(propertyId: number) {
    const data = await db.execute(
        `SELECT 
                jobs.id,
                jobs.property_id,
                IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
                jobs.type,
                jobs.title,
                DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
                jobs.urgency,
                DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
                jobs.completed,
                DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
                CONCAT(users.first_name, " ", users.last_name) AS reporter,
                jobs.status
            FROM 
                jobs
            LEFT JOIN users ON
                users.id = jobs.reporter
            LEFT JOIN assets ON
                assets.id = jobs.asset
            WHERE
                jobs.property_id = ?
            ORDER BY
                jobs.id
            DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getJobDetails(id: number) {
    const data = await db.execute(
        `SELECT 
            jobs.id,
            properties.name AS property_name,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            jobs.type,
            jobs.title,
            jobs.description,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            jobs.urgency,
            DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
            jobs.completed,
            DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
            CONCAT(users.first_name, " ", users.last_name) AS reporter,
            jobs.logged_time,
            jobs.status,
            jobs.notes
        FROM 
            jobs
        LEFT JOIN users ON
            users.id = jobs.reporter
        LEFT JOIN properties ON
            properties.id = jobs.property_id
        LEFT JOIN assets ON
            assets.id = jobs.asset
        WHERE
            jobs.id = ?;`,
        [id]
    );
    return data[0];
}

export async function getRecentJobs(idsForAssets: number[]) {
    const data = await db.execute(
        `SELECT
            jobs.id,
            IF (LENGTH(assets.name) > 0, assets.name, 'No Asset') AS asset_name,
            jobs.type,
            jobs.title,
            DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
            jobs.completed
        FROM
            jobs
        LEFT JOIN assets ON
            assets.id = jobs.asset
        WHERE
            asset IN (${idsForAssets})
        ORDER BY
            jobs.created
        DESC
        LIMIT
            5;`
    );
    return data[0];
}

interface TimeDetails extends RowDataPacket {
    id: number;
    time: number;
}

export async function getLoggedTimeDetails(jobId: number) {
    const data: [TimeDetails[], FieldPacket[]]  = await db.execute(
        `SELECT
            user_id AS id,
            time
        FROM
            logged_time
        WHERE
            job_id = ?;`,
        [jobId]
    );
    return data[0];
}

interface PostJob {
    propertyNumber: string;
    assetNumber: string;
    type: string;
    title: string;
    description: string;
    urgency: string;
    reporter: string;
}

interface UrgObj {
    number: string;
    duration: string;
}

export async function postJob(body: PostJob, urgencyObj: UrgObj[]) {
    const property_id = body.propertyNumber;
    const asset = body.assetNumber;
    const type = body.type;
    const title = body.title;
    const description = body.description;
    const urgency = body.urgency;
    const reporter = body.reporter;
    const numOfUrg = parseInt(urgencyObj[0].number);
    const lengthOfUrg = urgencyObj[0].duration;

    const response = await db.execute(
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
                reporter
            )
        VALUES
            (?,?,?,?,?, NOW() ,?, DATE_ADD(NOW(), INTERVAL ${numOfUrg} ${lengthOfUrg}) ,?);`,
        [property_id, asset, type, title, description, urgency, reporter]
    );
    return response[0];
}

interface UpdateAndComplete {
    id: number;
    status: string;
    description: string;
    notes: string;
    logged_time: number;
    complete: boolean;
}

export async function updateAndComplete(body: UpdateAndComplete) {
    const id = body.id;
    const status = body.status;
    const description = body.description;
    const notes = body.notes;
    const logged_time = body.logged_time;
    const completed = body.complete ? 1 : 0;

    const response = await db.execute(
        `UPDATE
            jobs
        SET
            status = ?,
            description = ?,
            notes = ?,
            logged_time = ?,
            completed = ?,
            comp_date = ${body.complete ? 'NOW()' : "'0000-00-00 00:00:00'"}
        WHERE
            id = ?;`,
        [status, description, notes, logged_time, completed, id]
    );
    return response[0];
}

export async function setTimeDetails(details: [{ id: number; time: number }], jobId: number) {
    const res = await db.execute(
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

        for (let i = 0; i < details.length; i++) {
            if (i == details.length - 1) {
                sql += `(${details[i].id}, ${jobId}, ${details[i].time})`;
            } else {
                sql += `(${details[i].id}, ${jobId}, ${details[i].time}),`;
            }
        }
        sql += `;`;

        const response = await db.execute(sql);
        return response[0];
    }
}

interface UpdateNotes {
    id: number;
    notes: string;
}
export async function updateNotes(body: UpdateNotes) {
    const id = body.id;
    const notes = body.notes;

    const response = await db.execute(
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
    const response = await db.execute(
        `DELETE FROM
            jobs
        WHERE
            asset IN (${idsForDelete});`
    );
    return response[0];
}