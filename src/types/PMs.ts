import { RowDataPacket } from "mysql2";

export interface ScheduleId extends RowDataPacket {
    schedule_id: number;
}

export interface ScheduleDates extends RowDataPacket {
    current_schedule: string;
    new_schedule: string;
}