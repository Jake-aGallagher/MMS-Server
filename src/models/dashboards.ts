import getConnection from '../database/database';
import { FieldPacket } from 'mysql2';
import {
    downtime6M,
    getIncompleteJobs,
    getJobsCompleted6M,
    getJobsRaised6M,
    lostRevenue6M,
    lostRevenueByAsset,
    sparesDeliveredCost6M,
    sparesMisssing6M,
} from '../helpers/graphs/defaultGraphs';
import { BreakdownPlanned } from '../types/dashboard';

export async function get6MFacilityGraph(
    client: string, 
    facilityId: number,
    type: 'raisedJobs' | 'completeJobs' | 'sparesCost' | 'sparesMissing' | 'revenue' | 'downtime',
    flipped: boolean = false
) {
    let data: { month: string; value: number }[] = [];
    switch (type) {
        case 'raisedJobs':
            data = await getJobsRaised6M(client, facilityId);
            break;
        case 'completeJobs':
            data = await getJobsCompleted6M(client, facilityId);
            break;
        case 'sparesCost':
            data = await sparesDeliveredCost6M(client, facilityId);
            break;
        case 'sparesMissing':
            data = await sparesMisssing6M(client, facilityId);
            break;
        case 'revenue':
            data = await lostRevenue6M(client, facilityId);
            break;
        default:
            data = await downtime6M(client, facilityId);
            break;
    }

    const thisMonth = data[5].value;
    let total = 0;
    const formattedArr = [];
    for (let i = 0; i < 6; i++) {
        if (i != 6) {
            total += data[i].value;
        }
        formattedArr.push({ label: data[i].month, value: data[i].value });
    }
    const avgData = { value: Math.round(((thisMonth / (total / 5)) * 100 - 100 + Number.EPSILON) * 100) / 100, flipped };

    return { thisMonth, mainData: formattedArr, avgData };
}

export async function getAssetLostRevenue(client: string, facilityId: number) {
    const data = await lostRevenueByAsset(client, facilityId);
    const formattedArr: { label: string; value: number}[] = [];
    
    for (let i = 0; i < data.length; i++) {
        formattedArr.push({ label: data[i].name, value: data[i].value });
    }

    return { mainData: formattedArr };
}

export async function getIncomplete(client: string, facilityId: number) {
    const data = await getIncompleteJobs(client, facilityId);
    const formattedArr = [
        { label: 'Non-overdue Job', value: data[0].incomplete },
        { label: 'Overdue Job', value: data[0].overdue },
        { label: 'Non-Overdue PM', value: data[1].incomplete },
        { label: 'Overdue PM', value: data[1].overdue },
    ];

    return { thisMonth: data[0].overdue + data[0].incomplete + data[1].overdue + data[1].incomplete, mainData: formattedArr };
}

export async function getBreakdownVsPlanned(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data: [BreakdownPlanned[], FieldPacket[]] = await db.execute(
        `SELECT
            COUNT(IF(completed = 0, 1, NULL)) AS result,
            1 AS dataset
        FROM
            jobs
        WHERE
            facility_id = ?
                    
        UNION
                    
        SELECT
            COUNT(IF(pms.completed = 0, 1, NULL)) AS result,
            2 AS dataset
        FROM
            pms
        INNER JOIN pm_schedules ON
            pms.schedule_id = pm_schedules.id
        WHERE
            pm_schedules.facility_id = ?;`,
        [facilityId, facilityId]
    );

    const dataArr = [
        { label: 'Breakdown', value: data[0][0].result },
        { label: 'Planned', value: data[0][1].result },
    ];
    return { mainData: dataArr };
}
