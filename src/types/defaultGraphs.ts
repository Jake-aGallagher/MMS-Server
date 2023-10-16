import { RowDataPacket } from 'mysql2';

export interface IncompleteJobs extends RowDataPacket {
    incomplete: number;
    overdue: number;
}

export interface JobsRaised5Months extends RowDataPacket {
    month_1: number;
    month_2: number;
    month_3: number;
    month_4: number;
    month_5: number;
}
