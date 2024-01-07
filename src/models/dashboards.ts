import { FieldPacket } from 'mysql2';
import db from '../database/database';
import { getIncompleteJobs, getJobsCompleted6M, getJobsRaised6M } from '../helpers/graphs/defaultGraphs';
import { BreakdownPlanned } from '../types/dashboard';

export async function getRaisedJobs(propertyId: number) {
    const data = await getJobsRaised6M(propertyId);
    const thisMonth = data[5].value;
    let total = 0;
    const formattedArr = [];
    for (let i = 0; i < 6; i++) {
        if (i != 6) {
            total += data[i].value;
        }
        formattedArr.push({ label: data[i].month, value: data[i].value });
    }
    const avgData = { value: Math.round((((thisMonth / (total / 5)) * 100 - 100) + Number.EPSILON) * 100) / 100, flipped: false };

    return { thisMonth, mainData: formattedArr, avgData };
}

export async function getIncomplete(propertyId: number) {
    const data = await getIncompleteJobs(propertyId);
    const formattedArr = [
        { label: 'Non-overdue Job', value: data[0].incomplete },
        { label: 'Overdue Job', value: data[0].overdue },
        { label: 'Non-Overdue PM', value: data[1].incomplete},
        { label: 'Overdue PM', value: data[1].overdue},
    ];

    return { thisMonth: data[0].overdue + data[0].incomplete + data[1].overdue + data[1].incomplete, mainData: formattedArr };
}

export async function getCompletedJobs(propertyId: number) {
    const data = await getJobsCompleted6M(propertyId);
    const thisMonth = data[5].value;
    let total = 0;
    const formattedArr = [];
    for (let i = 0; i < 6; i++) {
        if (i != 6) {
            total += data[i].value;
        }
        formattedArr.push({ label: data[i].month, value: data[i].value });
    }
    const avgData = { value: Math.round((((thisMonth / (total / 5)) * 100 - 100) + Number.EPSILON) * 100) / 100, flipped: true };

    return { thisMonth, mainData: formattedArr, avgData };
}

export async function getBreakdownVsPlanned(propertyId: number) {
    const data: [BreakdownPlanned[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(completed = 0, 1, NULL)) AS result
        FROM
            jobs
        WHERE
            property_id = ?
                    
        UNION
                    
        SELECT
            COUNT(IF(pms.completed = 0, 1, NULL)) AS result
        FROM
            pms
        INNER JOIN pm_schedules ON
            pms.schedule_id = pm_schedules.id
        WHERE
            pm_schedules.property_id = ?;`,
        [propertyId, propertyId]
    );

    const dataArr = [
        { label: 'Breakdown', value: data[0][0].result },
        { label: 'Planned', value: data[0][1].result },
    ]
    return { mainData: dataArr };
}