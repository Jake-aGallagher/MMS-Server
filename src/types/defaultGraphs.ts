import { RowDataPacket } from 'mysql2';

export interface IncompleteJobs extends RowDataPacket {
    incomplete: number;
    overdue: number;
}

export interface DefaultGraph1M extends RowDataPacket {
    month_1: number;
}

export interface DefaultGraph3M extends DefaultGraph1M {
    month_2: number;
    month_3: number;
}

export interface DefaultGraph6M extends DefaultGraph3M {
    month_4: number;
    month_5: number;
    month_6: number;
}

export interface StringGraph extends RowDataPacket {
    month_1: string | null;
    month_2: string | null;
    month_3: string | null;
    month_4: string | null;
    month_5: string | null;
    month_6: string | null;
}

export interface NameValue extends RowDataPacket {
    name: string;
    value: number;
}