import db from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { IncompleteJobs, JobsRaised5Months } from '../../types/defaultGraphs';

export async function getIncompleteJobs(propertyId: number) {
    const data: [IncompleteJobs[], FieldPacket[]] = await db.execute(
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

export async function getJobsRaised5Months(propertyId: number) {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
        'January',
        'February',
        'March',
        'April',
    ];
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 4 ? endNum - 4 : 8 + endNum;

    const data: [JobsRaised5Months[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(MONTHNAME(created) = "${months[startNum]}", 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(created) = "${months[startNum + 1]}", 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(created) = "${months[startNum + 2]}", 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(created) = "${months[startNum + 3]}", 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(created) = "${months[startNum + 4]}", 1, NULL)) AS month_5
        FROM
            jobs
        WHERE
            property_id = ?;`,
        [propertyId]
    );
    const returnObj = [
        { month: months[startNum], value: data[0][0].month_1 },
        { month: months[startNum + 1], value: data[0][0].month_2 },
        { month: months[startNum + 2], value: data[0][0].month_3 },
        { month: months[startNum + 3], value: data[0][0].month_4 },
        { month: months[startNum + 4], value: data[0][0].month_5 },
    ];
    return returnObj;
}
