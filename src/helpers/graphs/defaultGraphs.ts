import db from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { DefaultGraph6Months, IncompleteJobs } from '../../types/defaultGraphs';
import { monthsLooped } from './monthsLooped';

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
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6Months[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum]}", 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 1]}", 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 2]}", 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 3]}", 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 4]}", 1, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 5]}", 1, NULL)) AS month_6
        FROM
            jobs
        WHERE
            property_id = ?;`,
        [propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: data[0][0].month_1 },
        { month: monthsLooped[startNum + 1], value: data[0][0].month_2 },
        { month: monthsLooped[startNum + 2], value: data[0][0].month_3 },
        { month: monthsLooped[startNum + 3], value: data[0][0].month_4 },
        { month: monthsLooped[startNum + 4], value: data[0][0].month_5 },
        { month: monthsLooped[startNum + 5], value: data[0][0].month_6 },
    ];
    return returnObj;
}

export async function getSparesUsed6Months(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6Months[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum]}", quantity, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 1]}", quantity, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 2]}", quantity, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 3]}", quantity, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 4]}", quantity, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 5]}", quantity, NULL)) AS month_6
        FROM
            spares_used
        WHERE
            property_id = ?;`,
        [propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: data[0][0].month_1 },
        { month: monthsLooped[startNum + 1], value: data[0][0].month_2 },
        { month: monthsLooped[startNum + 2], value: data[0][0].month_3 },
        { month: monthsLooped[startNum + 3], value: data[0][0].month_4 },
        { month: monthsLooped[startNum + 4], value: data[0][0].month_5 },
        { month: monthsLooped[startNum + 5], value: data[0][0].month_6 },
    ];
    return returnObj;
}
