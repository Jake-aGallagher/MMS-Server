import { RowDataPacket } from 'mysql2';

export interface ScheduleId extends RowDataPacket {
    schedule_id: number;
}

export interface ScheduleDates extends RowDataPacket {
    current_schedule: string;
    new_schedule: string;
}

export interface PMDetails extends RowDataPacket {
    id: number;
    schedule_id: number;
    title: string;
    asset: string;
    type_id: number;
    type: string;
    description: string;
    notes: string;
    created: string;
    required_comp_date: string;
    status: string;
    completed: number;
    comp_date: string;
    logged_time: number;
}

export interface PMStatusNotesType extends RowDataPacket {
    status: number;
    notes: string;
    type: number;
}
