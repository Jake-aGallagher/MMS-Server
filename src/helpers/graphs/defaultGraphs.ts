import db from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { DefaultGraph6M, IncompleteJobs, NameValue, StringGraph } from '../../types/defaultGraphs';
import { monthsLooped } from './monthsLooped';

export async function getIncompleteJobs(propertyId: number) {
    const data: [IncompleteJobs[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(completed = 0 AND required_comp_date > CURDATE(), 1, NULL)) AS incomplete,
            COUNT(IF(completed = 0 AND required_comp_date <= CURDATE(), 1, NULL)) AS overdue,
            1 AS dataset
        FROM
            jobs
        WHERE
            property_id = ?
        
        UNION
        
        SELECT
            COUNT(IF(completed = 0 AND required_comp_date > CURDATE(), 1, NULL)) AS incomplete,
            COUNT(IF(completed = 0 AND required_comp_date <= CURDATE(), 1, NULL)) AS overdue,
            2 AS dataset
        FROM
            pms
        INNER JOIN pm_schedules ON
            pms.schedule_id = pm_schedules.id
        WHERE
            pm_schedules.property_id = ?;`,
        [propertyId, propertyId]
    );
    return data[0];
}

export async function getJobsRaised6M(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6M[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 1]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 2]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 3]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 4]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(created) = "${monthsLooped[startNum + 5]}" && created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_6,
            1 AS dataset
        FROM
            jobs
        WHERE
            property_id = ?
        
        UNION
        
        SELECT
            COUNT(IF(MONTHNAME(pms.created) = "${monthsLooped[startNum]}" && pms.created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(pms.created) = "${monthsLooped[startNum + 1]}" && pms.created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(pms.created) = "${monthsLooped[startNum + 2]}" && pms.created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(pms.created) = "${monthsLooped[startNum + 3]}" && pms.created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(pms.created) = "${monthsLooped[startNum + 4]}" && pms.created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(pms.created) = "${monthsLooped[startNum + 5]}" && pms.created > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_6,
            2 AS dataset
        FROM
            pms
        INNER JOIN pm_schedules ON
            pms.schedule_id = pm_schedules.id
        WHERE
            pm_schedules.property_id = ?;`,
        [propertyId, propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: data[0][0].month_1 + data[0][1].month_1 },
        { month: monthsLooped[startNum + 1], value: data[0][0].month_2 + data[0][1].month_2 },
        { month: monthsLooped[startNum + 2], value: data[0][0].month_3 + data[0][1].month_3 },
        { month: monthsLooped[startNum + 3], value: data[0][0].month_4 + data[0][1].month_4 },
        { month: monthsLooped[startNum + 4], value: data[0][0].month_5 + data[0][1].month_5 },
        { month: monthsLooped[startNum + 5], value: data[0][0].month_6 + data[0][1].month_6 },
    ];
    return returnObj;
}

export async function getJobsCompleted6M(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6M[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 1]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 2]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 3]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 4]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 5]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_6,
            1 AS dataset
        FROM
            jobs
        WHERE
            property_id = ?
            
        UNION
        
        SELECT
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_1,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 1]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_2,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 2]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_3,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 3]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_4,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 4]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_5,
            COUNT(IF(MONTHNAME(comp_date) = "${monthsLooped[startNum + 5]}" && comp_date > DATE_SUB(NOW(), INTERVAL 7 MONTH), 1, NULL)) AS month_6,
            2 AS dataset
        FROM
            pms
        INNER JOIN pm_schedules ON
            pms.schedule_id = pm_schedules.id
        WHERE
            pm_schedules.property_id = ?;`,
        [propertyId, propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: data[0][0].month_1 + data[0][1].month_1 },
        { month: monthsLooped[startNum + 1], value: data[0][0].month_2 + data[0][1].month_2 },
        { month: monthsLooped[startNum + 2], value: data[0][0].month_3 + data[0][1].month_3 },
        { month: monthsLooped[startNum + 3], value: data[0][0].month_4 + data[0][1].month_4 },
        { month: monthsLooped[startNum + 4], value: data[0][0].month_5 + data[0][1].month_5 },
        { month: monthsLooped[startNum + 5], value: data[0][0].month_6 + data[0][1].month_6 },
    ];
    return returnObj;
}

export async function getSparesUsed6M(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6M[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_1,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 1]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_2,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 2]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_3,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 3]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_4,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 4]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_5,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 5]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_6
        FROM
            spares_used
        WHERE
            property_id = ?
        AND
            record_type = 'used';`,
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

export async function mostUsedSpares6M(propertyId: number) {
    const data: [NameValue[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(spares_used.quantity) as value,
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
            spares_used.record_type = 'used'
        AND
            spares_used.date_used > DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY
            spares.name
        ORDER BY
            value DESC
        LIMIT
            5;`,
        [propertyId]
    );
    return data[0];
}

export async function sparesCost6M(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [StringGraph[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), (spares_used.quantity * spares.cost), NULL)) AS month_1,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 1]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), (spares_used.quantity * spares.cost), NULL)) AS month_2,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 2]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), (spares_used.quantity * spares.cost), NULL)) AS month_3,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 3]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), (spares_used.quantity * spares.cost), NULL)) AS month_4,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 4]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), (spares_used.quantity * spares.cost), NULL)) AS month_5,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 5]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), (spares_used.quantity * spares.cost), NULL)) AS month_6
        FROM
            spares_used
        INNER JOIN spares ON
        (
            spares.id = spares_used.spare_id
        )
        WHERE
            spares_used.property_id = ?
        AND
            spares_used.record_type = 'used';`,
        [propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: parseFloat(data[0][0].month_1 || '0') },
        { month: monthsLooped[startNum + 1], value: parseFloat(data[0][0].month_2 || '0') },
        { month: monthsLooped[startNum + 2], value: parseFloat(data[0][0].month_3 || '0') },
        { month: monthsLooped[startNum + 3], value: parseFloat(data[0][0].month_4 || '0') },
        { month: monthsLooped[startNum + 4], value: parseFloat(data[0][0].month_5 || '0') },
        { month: monthsLooped[startNum + 5], value: parseFloat(data[0][0].month_6 || '0') },
    ];
    return returnObj;
}

export async function sparesDeliveredCost6M(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [StringGraph[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(placed) = "${monthsLooped[startNum]}" && placed > DATE_SUB(NOW(), INTERVAL 7 MONTH), (delivery_items.quantity * delivery_items.value), NULL)) AS month_1,
            SUM(IF(MONTHNAME(placed) = "${monthsLooped[startNum + 1]}" && placed > DATE_SUB(NOW(), INTERVAL 7 MONTH), (delivery_items.quantity * delivery_items.value), NULL)) AS month_2,
            SUM(IF(MONTHNAME(placed) = "${monthsLooped[startNum + 2]}" && placed > DATE_SUB(NOW(), INTERVAL 7 MONTH), (delivery_items.quantity * delivery_items.value), NULL)) AS month_3,
            SUM(IF(MONTHNAME(placed) = "${monthsLooped[startNum + 3]}" && placed > DATE_SUB(NOW(), INTERVAL 7 MONTH), (delivery_items.quantity * delivery_items.value), NULL)) AS month_4,
            SUM(IF(MONTHNAME(placed) = "${monthsLooped[startNum + 4]}" && placed > DATE_SUB(NOW(), INTERVAL 7 MONTH), (delivery_items.quantity * delivery_items.value), NULL)) AS month_5,
            SUM(IF(MONTHNAME(placed) = "${monthsLooped[startNum + 5]}" && placed > DATE_SUB(NOW(), INTERVAL 7 MONTH), (delivery_items.quantity * delivery_items.value), NULL)) AS month_6
        FROM
            delivery_items
        INNER JOIN deliveries ON
        (
            deliveries.id = delivery_items.delivery_id
        )
        WHERE
            deliveries.property_id = ?;`,
        [propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: parseFloat(data[0][0].month_1 || '0') },
        { month: monthsLooped[startNum + 1], value: parseFloat(data[0][0].month_2 || '0') },
        { month: monthsLooped[startNum + 2], value: parseFloat(data[0][0].month_3 || '0') },
        { month: monthsLooped[startNum + 3], value: parseFloat(data[0][0].month_4 || '0') },
        { month: monthsLooped[startNum + 4], value: parseFloat(data[0][0].month_5 || '0') },
        { month: monthsLooped[startNum + 5], value: parseFloat(data[0][0].month_6 || '0') },
    ];
    return returnObj;
}

export async function jobsOfComponents6M(assetIds: number[]) {
    const data: [NameValue[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(*) as value,
            assets.name
        FROM
            jobs
        INNER JOIN assets ON
        (
            assets.id = jobs.asset
        )
        WHERE
            assets.id IN (${assetIds})
        AND
            jobs.created > DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY
            assets.name
        ORDER BY
            value DESC
        LIMIT
            5;`
    );
    return data[0];
}

export async function incompleteForAsset(assetIds: number[]) {
    const data: [IncompleteJobs[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(completed = 0 AND required_comp_date > CURDATE(), 1, NULL)) AS incomplete,
            COUNT(IF(completed = 0 AND required_comp_date <= CURDATE(), 1, NULL)) AS overdue,
            1 AS dataset
        FROM
            jobs
        WHERE
            asset IN (${assetIds})
        
        UNION
        
        SELECT
            COUNT(IF(completed = 0 AND required_comp_date > CURDATE(), 1, NULL)) AS incomplete,
            COUNT(IF(completed = 0 AND required_comp_date <= CURDATE(), 1, NULL)) AS overdue,
            2 AS dataset
        FROM
            pms
        INNER JOIN pm_schedules ON
            pms.schedule_id = pm_schedules.id
        WHERE
            pm_schedules.asset_id IN (${assetIds});`
    );
    return data[0];
}

export async function sparesUsed6M(spareId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [DefaultGraph6M[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_1,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 1]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_2,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 2]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_3,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 3]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_4,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 4]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_5,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 5]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_6
        FROM
            spares_used
        WHERE
            spare_id = ?
        AND
            record_type = 'used';`,
        [spareId]
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

export async function sparesMisssing6M(propertyId: number) {
    const d = new Date();
    const endNum = d.getMonth();
    let startNum = endNum >= 5 ? endNum - 5 : 7 + endNum;

    const data: [StringGraph[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_1,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 1]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_2,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 2]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_3,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 3]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_4,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 4]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_5,
            SUM(IF(MONTHNAME(date_used) = "${monthsLooped[startNum + 5]}" && date_used > DATE_SUB(NOW(), INTERVAL 7 MONTH), quantity, NULL)) AS month_6
        FROM
            spares_used
        WHERE
            property_id = ?
        AND
            record_type = 'missing';`,
        [propertyId]
    );
    const returnObj = [
        { month: monthsLooped[startNum], value: parseFloat(data[0][0].month_1 || '0') },
        { month: monthsLooped[startNum + 1], value: parseFloat(data[0][0].month_2 || '0') },
        { month: monthsLooped[startNum + 2], value: parseFloat(data[0][0].month_3 || '0') },
        { month: monthsLooped[startNum + 3], value: parseFloat(data[0][0].month_4 || '0') },
        { month: monthsLooped[startNum + 4], value: parseFloat(data[0][0].month_5 || '0') },
        { month: monthsLooped[startNum + 5], value: parseFloat(data[0][0].month_6 || '0') },
    ];
    return returnObj;
}