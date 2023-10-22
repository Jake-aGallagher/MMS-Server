import db from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { DefaultGraph6Months, IncompleteJobs, MostUsedSpares6Months } from '../../types/defaultGraphs';
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

export async function getJobsRaised6Months(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6Months[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 1]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 2]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 3]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 4]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 5]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_6
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
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 1]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 2]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 3]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 4]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 5]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_6
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

export async function mostUsedSpares6Months(propertyId: number) {
    const data: [MostUsedSpares6Months[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(spares_used.quantity) as quantity,
            spares.name as name
        FROM
            spares_used
        INNER JOIN spares ON
        (
            spares.id = spares_used.spare_id
        )
        WHERE
            spares_used.property_id = ?
        AND
            spares_used.date_used > DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY
            spares.name
        ORDER BY
            quantity DESC
        LIMIT
            5;`,
        [propertyId]
    );
    return data[0];
}
