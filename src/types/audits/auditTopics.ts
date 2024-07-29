import { RowDataPacket } from "mysql2";

export interface AuditTopic extends RowDataPacket {
    id: number;
    title: string;
    version_id: number;
    sort_order: number;
}