import db from '../database/database';

export async function getAllJobs() {
    const response = await db.execute(
        `SELECT
             id,
             property_id,
             asset,
             type,
             title,
             description,
             DATE_FORMAT(jobs.created, "%d/%m/%y") AS 'created',
             urgency,
             DATE_FORMAT(jobs.required_comp_date, "%d/%m/%y") AS 'required_comp_date',
             completed,
             DATE_FORMAT(jobs.comp_date, "%d/%m/%y") AS 'comp_date',
             reporter,
             logged_time,
             status,
             notes
        FROM
            jobs
        ORDER BY
            id
        DESC;`
    );
    return response[0];
}

