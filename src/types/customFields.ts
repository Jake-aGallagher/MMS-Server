import { RowDataPacket } from "mysql2";

export interface GetFields extends RowDataPacket {
    id: number;
    name: string;
    type: string;
    enum_group_id: number | null;
    required: number;
    sort_order: number;
}

export interface EditField {
    type: string;
    enumGroupId: number | null;
    name: string;
    required: number;
    order: number;
}

export interface AddField extends EditField{
    model: string;
    modelId?: number;
}

export interface FieldValue extends RowDataPacket {
    id: number;
    enumGroupId: number | null;
    type: string;
    value: string;
}