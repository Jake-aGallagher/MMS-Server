import { RowDataPacket } from "mysql2";

export interface BreakdownPlanned extends RowDataPacket {
    breakdown: number;
    planned: number;
}