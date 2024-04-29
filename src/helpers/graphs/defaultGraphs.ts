import db from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { DefaultGraph6M, IncompleteJobs, MonthData, MonthDataNumber, NameValue, StringGraph } from '../../types/defaultGraphs';
import { monthsLooped } from './monthsLooped';

function makeStartNum() {
    const d = new Date();
    const endNum = d.getMonth();
    return endNum >= 5 ? endNum - 5 : 7 + endNum;
}

function makeReturnObj(startNum: number, data: MonthData) {
    return [
        { month: monthsLooped[startNum], value: parseFloat(data.month_1 || '0') },
        { month: monthsLooped[startNum + 1], value: parseFloat(data.month_2 || '0') },
        { month: monthsLooped[startNum + 2], value: parseFloat(data.month_3 || '0') },
        { month: monthsLooped[startNum + 3], value: parseFloat(data.month_4 || '0') },
        { month: monthsLooped[startNum + 4], value: parseFloat(data.month_5 || '0') },
        { month: monthsLooped[startNum + 5], value: parseFloat(data.month_6 || '0') },
    ];
}

function makeUnionReturnObj(startNum: number, a: MonthDataNumber, b: MonthDataNumber) {
    return [
        { month: monthsLooped[startNum], value: a.month_1 + b.month_1 },
        { month: monthsLooped[startNum + 1], value: a.month_2 + b.month_2 },
        { month: monthsLooped[startNum + 2], value: a.month_3 + b.month_3 },
        { month: monthsLooped[startNum + 3], value: a.month_4 + b.month_4 },
        { month: monthsLooped[startNum + 4], value: a.month_5 + b.month_5 },
        { month: monthsLooped[startNum + 5], value: a.month_6 + b.month_6 },
    ];
}

export async function getIncompleteJobs(facilityId: number) {
    const data: [IncompleteJobs[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(completed = 0 AND required_comp_date > CURDATE(), 1, NULL)) AS incomplete,
            COUNT(IF(completed = 0 AND required_comp_date <= CURDATE(), 1, NULL)) AS overdue,
            1 AS dataset
        FROM
            jobs
        WHERE
            facility_id = ?
        
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
            pm_schedules.facility_id = ?;`,
        [facilityId, facilityId]
    );
    return data[0];
}

export async function getJobsRaised6M(facilityId: number) {
    let startNum = makeStartNum();

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
            facility_id = ?
        
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
            pm_schedules.facility_id = ?;`,
        [facilityId, facilityId]
    );

    return makeUnionReturnObj(startNum, data[0][0], data[0][1]);
}

export async function getJobsCompleted6M(facilityId: number) {
    let startNum = makeStartNum();

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
            facility_id = ?
            
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
            pm_schedules.facility_id = ?;`,
        [facilityId, facilityId]
    );
    
    return makeUnionReturnObj(startNum, data[0][0], data[0][1]);
}

export async function getSparesUsed6M(facilityId: number) {
    let startNum = makeStartNum();

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
            facility_id = ?
        AND
            record_type = 'used';`,
        [facilityId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
}

export async function mostUsedSpares6M(facilityId: number) {
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
            spares_used.facility_id = ?
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
        [facilityId]
    );
    return data[0];
}

export async function sparesCost6M(facilityId: number) {
    let startNum = makeStartNum();

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
            spares_used.facility_id = ?
        AND
            spares_used.record_type = 'used';`,
        [facilityId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
}

export async function sparesDeliveredCost6M(facilityId: number) {
    let startNum = makeStartNum();

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
            deliveries.facility_id = ?;`,
        [facilityId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
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
    let startNum = makeStartNum();

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
            spare_id = ?
        AND
            record_type = 'used';`,
        [spareId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
}

export async function sparesMisssing6M(facilityId: number) {
    let startNum = makeStartNum();

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
            facility_id = ?
        AND
            record_type = 'missing';`,
        [facilityId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
}

export async function downtime6M(facilityId: number) {
    let startNum = makeStartNum();

    const data: [StringGraph[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(date) = "${monthsLooped[startNum]}" && date > DATE_SUB(NOW(), INTERVAL 7 MONTH), time, NULL)) AS month_1,
            SUM(IF(MONTHNAME(date) = "${monthsLooped[startNum + 1]}" && date > DATE_SUB(NOW(), INTERVAL 7 MONTH), time, NULL)) AS month_2,
            SUM(IF(MONTHNAME(date) = "${monthsLooped[startNum + 2]}" && date > DATE_SUB(NOW(), INTERVAL 7 MONTH), time, NULL)) AS month_3,
            SUM(IF(MONTHNAME(date) = "${monthsLooped[startNum + 3]}" && date > DATE_SUB(NOW(), INTERVAL 7 MONTH), time, NULL)) AS month_4,
            SUM(IF(MONTHNAME(date) = "${monthsLooped[startNum + 4]}" && date > DATE_SUB(NOW(), INTERVAL 7 MONTH), time, NULL)) AS month_5,
            SUM(IF(MONTHNAME(date) = "${monthsLooped[startNum + 5]}" && date > DATE_SUB(NOW(), INTERVAL 7 MONTH), time, NULL)) AS month_6
        FROM
            downtime
        WHERE
            facility_id = ?;`,
        [facilityId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
}

export async function lostRevenue6M(facilityId: number) {
    let startNum = makeStartNum();

    const data: [StringGraph[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(IF(MONTHNAME(downtime.date) = "${monthsLooped[startNum]}" && downtime.date > DATE_SUB(NOW(), INTERVAL 7 MONTH), (downtime.time * assets.revenue), NULL)) AS month_1,
            SUM(IF(MONTHNAME(downtime.date) = "${monthsLooped[startNum + 1]}" && downtime.date > DATE_SUB(NOW(), INTERVAL 7 MONTH), (downtime.time * assets.revenue), NULL)) AS month_2,
            SUM(IF(MONTHNAME(downtime.date) = "${monthsLooped[startNum + 2]}" && downtime.date > DATE_SUB(NOW(), INTERVAL 7 MONTH), (downtime.time * assets.revenue), NULL)) AS month_3,
            SUM(IF(MONTHNAME(downtime.date) = "${monthsLooped[startNum + 3]}" && downtime.date > DATE_SUB(NOW(), INTERVAL 7 MONTH), (downtime.time * assets.revenue), NULL)) AS month_4,
            SUM(IF(MONTHNAME(downtime.date) = "${monthsLooped[startNum + 4]}" && downtime.date > DATE_SUB(NOW(), INTERVAL 7 MONTH), (downtime.time * assets.revenue), NULL)) AS month_5,
            SUM(IF(MONTHNAME(downtime.date) = "${monthsLooped[startNum + 5]}" && downtime.date > DATE_SUB(NOW(), INTERVAL 7 MONTH), (downtime.time * assets.revenue), NULL)) AS month_6
        FROM
            downtime
        INNER JOIN assets ON
            assets.id = downtime.asset
        WHERE
            downtime.facility_id = ?;`,
        [facilityId]
    );
    
    return makeReturnObj(startNum, data[0][0]);
}

export async function lostRevenueByAsset(facilityId: number) {
    const data: [NameValue[], FieldPacket[]] = await db.execute(
        `SELECT
            SUM(downtime.time * assets.revenue) as value,
            assets.name
        FROM
            downtime
        INNER JOIN assets ON
            assets.id = downtime.asset
        WHERE
            downtime.facility_id = ?
        AND
            downtime.date > DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY
            assets.name
        ORDER BY
            value DESC
        LIMIT
            5;`,
        [facilityId]
    );
    return data[0];
}