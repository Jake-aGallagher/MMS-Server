import { RowDataPacket } from "mysql2";

// Facility //

export interface FacilityId extends RowDataPacket {
    id: number;
}

export interface FacilityBasics extends FacilityId {
    name: string;
}

export interface Facility extends FacilityBasics {
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