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