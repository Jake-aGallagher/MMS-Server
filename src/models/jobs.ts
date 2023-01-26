import db from '../database/database';

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
    )
    return data[0]
}

export async function deleteJobs(idsForDelete: number[]) {
    const response = await db.execute(
        `DELETE FROM
            jobs
        WHERE
            asset IN (${idsForDelete});`
    )
    return response[0]
}