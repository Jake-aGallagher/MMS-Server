import { RowDataPacket } from "mysql2";

// Property //

export interface PropertyId extends RowDataPacket {
    id: number;
}

export interface PropertyBasics extends PropertyId {
    name: string;
}

export interface Property extends PropertyBasics {
    type: string;
    address: string;
    city: string;
    county: string;
    postcode: string;
}

// Assigned Users //

export interface AssignedBasic extends RowDataPacket {
    id: number;
}

export interface Assigned extends AssignedBasic {
    username: string;
    first_name: string;
    last_name: string;
    user_group_id: number;
}