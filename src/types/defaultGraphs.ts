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

export interface MostUsedSpares6M extends RowDataPacket {
    quantity: number;
    name: string;
}
