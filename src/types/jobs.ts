import { RowDataPacket } from "mysql2";

// Job //

export interface PostJob {
    propertyNumber: string;
    assetNumber: string;
    type: string;
    title: string;
    description: string;
    urgency: string;
    reporter: string;
}

export interface UpdateAndComplete {
    id: number;
    status: string;
    description: string;
    notes: string;
    logged_time: number;
    complete: boolean;
}

export interface RecentJobs  extends RowDataPacket {
    id: number;
    asset_name: string;
    type: string;
    title: string;
    created: string;
    completed: boolean;
}

// Logged Time //

export interface TimeDetails extends RowDataPacket {
    id: number;
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