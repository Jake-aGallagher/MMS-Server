import { RowDataPacket } from 'mysql2';

export interface AuditVersion extends RowDataPacket {
    latest_version: number;
}

export interface AuditTemplateVersion extends RowDataPacket {
    id: number;
    title: string;
    version: number;
    published: number;
}

export interface LatestDetails extends AuditVersion {
    id: number;
}
