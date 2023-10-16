import db from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { TimeDetails } from '../../types/jobs';

export async function getIncompleteJobs(propertyId: number) {
    const data: [TimeDetails[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(completed = 0 AND required_comp_date > CURDATE(), 1, NULL)) AS incomplete,
            COUNT(IF(completed = 0 AND required_comp_date <= CURDATE(), 1, NULL)) AS overdue
        FROM
            jobs
        WHERE
            property_id = ?;`,
        [propertyId]
    );
    return data[0];
}
