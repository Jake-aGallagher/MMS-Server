import { RowDataPacket } from "mysql2";

export interface AuditId extends RowDataPacket {
    id: number;
    version_id: number;
}