import { RowDataPacket } from 'mysql2';

export interface PayloadBasics extends RowDataPacket {
    number: string;
    duration: string;
}

export interface UrgObj {
    number: string;
    duration: string;
}

export interface StatusTypes extends RowDataPacket {
    id: number;
    value: string;
    list_priority: number;
    can_complete: number;
    initial_status: number;
}
