import { RowDataPacket } from "mysql2";

export interface AuditQuestion extends RowDataPacket {
    id: number;
    title: string;
    topic_id: number;
    question_type: string;
    sort_order: number;
    options?: AuditQuestionOption[];
}

export interface AuditQuestionOption extends RowDataPacket {
    id: number;
    question_id: number;
    title: string;
}

export interface AuditOption extends RowDataPacket {
    id: number;
    question_id: number;
    title: string;
    sort_order: number;
}