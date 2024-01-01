import { RowDataPacket } from "mysql2";

export interface TemplateId extends RowDataPacket {
    template_id: number;
}

export interface ScheduleDates extends RowDataPacket {
    current_schedule: string;
    new_schedule: string;
}