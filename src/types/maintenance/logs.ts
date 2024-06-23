import { RowDataPacket } from "mysql2";

export interface LogTemplateId extends RowDataPacket {
    log_template_id: number;
}

export interface LogTemplateTitle extends RowDataPacket {
    title: string;
    description: string;
}

export interface LogTemplate extends LogTemplateTitle {
    id: number;
    created: string;
    frequency: string;
    last_comp_date: string;
    next_due_date: string;
    up_to_date: number;
}

export interface LogDates extends RowDataPacket {
    current_schedule: string;
    new_schedule: string;
}

export interface AllLogs extends RowDataPacket {
    id: number;
    title: string;
    created: string;
    required_comp_date: string;
    completed: number;
    comp_date: string;
    frequency: string;
}

export interface Log extends AllLogs {
    description: string;
    type_id: number;
}

export interface LogForEdit extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    frequency_time: number;
    frequency_unit: string;
}

export interface LogTemplateFields extends RowDataPacket {
    id: number;
    type: string;
    enumGroupId: number | null;
    name: string;
    required: boolean;
    sort_order: number;
}

export interface LogFieldValues extends RowDataPacket {
    id: number;
    name: string;
    type: string;
    enumGroupId: number | null;
    required: number;
    value: string;
}