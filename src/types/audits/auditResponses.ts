import { RowDataPacket } from 'mysql2';

export interface AuditResponse extends RowDataPacket {
    id: number;
    audit_id: number;
    question_id: number;
    response: string;
}

export interface AuditResponseForInsert {
    question_id: number;
    response: string;
}