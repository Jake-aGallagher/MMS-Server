import { RowDataPacket } from 'mysql2';

// Job //

export interface JobDetails extends RowDataPacket {
    id: number;
    property_id: number;
    asset_id: number;
    asset_name: string;
    type_id: number;
    type: string;
    title: string;
    description: string;
    urgency: string;
    status: string;
    reported_by: string;
    created: string;
    completed: boolean;
    logged_time: number;
    notes: string;
    scheduled: number;
    frequency_interval: number;
    frequency_time_unit: string;
}

export interface JobDetailsForReentry extends RowDataPacket {
    property_id: number;
    asset: number;
    type: number;
    title: string;
    description: string;
    required_comp_date: string;
    reported_by: string;
    frequency_time: number;
    frequency_unit: string;
}

export interface PostJob {
    propertyNumber: string;
    assetNumber: string;
    breakdownOrSchedule: string;
    type: string;
    title: string;
    description: string;
    urgency: string;
    reported_by: string;
    startNow: string;
    scheduleStart: string;
    intervalFrequency: number;
    intervalTimeUnit: string;
}

export interface PostScheduledJob {
    propertyNumber: string;
    assetNumber: string;
    type: string;
    title: string;
    description: string;
    reported_by: string;
    startNow: string;
    scheduleStart: string;
    intervalFrequency: number;
    intervalTimeUnit: string;
}

export interface Frequency extends RowDataPacket {
    frequency_interval: number;
    frequency_unit: string;
}

export interface IsScheduled extends RowDataPacket {
    scheduled: number;
}

export interface UpdateAndComplete {
    id: number;
    status: string;
    description: string;
    notes: string;
    logged_time: number;
    complete: boolean;
}

export interface RecentJobs extends RowDataPacket {
    id: number;
    asset_name: string;
    type: string;
    title: string;
    created: string;
    completed: boolean;
}

export interface InitialStatus extends RowDataPacket {
    id: number;
}

// Logged Time //

export interface TimeDetails extends RowDataPacket {
    id: number;
    name: string;
    time: number;
}

export interface TimeDetailsFull {
    id: number;
    time: number;
    first: string;
    last: string;
}

// Job Notes //

export interface UpdateNotes {
    id: number;
    notes: string;
}
