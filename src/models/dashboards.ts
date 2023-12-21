//import { FieldPacket, ResultSetHeader } from 'mysql2';
//import db from '../database/database';
import { getIncompleteJobs, getJobsCompleted6M, getJobsRaised6M } from '../helpers/graphs/defaultGraphs';

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
    const avgData = { value: (thisMonth / (total / 5)) * 100 - 100, flipped: false };

    return { thisMonth, mainData: formattedArr, avgData };
}

export async function getIncomplete(propertyId: number) {
    const data = await getIncompleteJobs(propertyId);
    const formattedArr = [
        { label: 'Open & Not Due', value: data[0].incomplete },
        { label: 'Open & Overdue', value: data[0].overdue },
    ];

    return { thisMonth: data[0].overdue + data[0].incomplete, mainData: formattedArr };
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
    const avgData = { value: (thisMonth / (total / 5)) * 100 - 100, flipped: true };

    return { thisMonth, mainData: formattedArr, avgData };
}