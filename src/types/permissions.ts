import { RowDataPacket } from 'mysql2';

export interface AllPermissions extends RowDataPacket {
    id: number;
    area: string;
    permission: string;
    full_string: string;
}

export interface GroupPermissions extends RowDataPacket {
    id: number;
}

export interface GroupPermObj extends RowDataPacket {
    area: string;
    permission: string;
}

export interface PermissionsList {
    id: number;
    area: string;
    permission: string;
    full_string: string;
    selected: boolean;
}
