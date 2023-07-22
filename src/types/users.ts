import { RowDataPacket } from "mysql2";

export interface UserGroupOnly extends RowDataPacket{
    user_group_id: number
}

export interface UserIdOnly extends RowDataPacket {
    id: number;
}

export interface UserBase extends UserIdOnly {
    username: string;
    user_group_id: number;
}

export interface UserLongName extends UserBase {
    first_name: string;
    last_name: string;
}

export interface UserShortName extends UserBase {
    first: string;
    last: string;
}

export interface UserPassword extends UserShortName { // Do not Extend this Type, use only where Password is necessary.
    password: string;
}