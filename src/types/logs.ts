import { RowDataPacket } from "mysql2";

export interface LogTemplateTitle extends RowDataPacket {
    title: string;
}

export interface LogTemplate extends LogTemplateTitle {
    id: number;
    description: string;
    frequency_time: number;
    frequency_unit: string;
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
    name: string;
    required: boolean;
    guidance: string;
    sort_order: number;
}

export interface LogFieldValues extends RowDataPacket {
    id: number;
    type: string;
    name: string;
    value: string;
}