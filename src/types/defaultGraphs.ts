import { RowDataPacket } from 'mysql2';

export interface IncompleteJobs extends RowDataPacket {
    incomplete: number;
    overdue: number;
}

export interface DefaultGraph1Month extends RowDataPacket {
    month_1: number;
}

export interface DefaultGraph3Months extends DefaultGraph1Month {
    month_2: number;
    month_3: number;
}

export interface DefaultGraph6Months extends DefaultGraph3Months {
    month_4: number;
    month_5: number;
    month_6: number;
}

export interface MostUsedSpares6Months extends RowDataPacket {
    quantity: number;
    name: string;
}
