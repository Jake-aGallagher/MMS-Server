import { RowDataPacket } from "mysql2";

export interface PayloadBasics extends RowDataPacket {
    number: string;
    duration: string;
}

export interface UrgObj {
    number: string;
    duration: string;
}