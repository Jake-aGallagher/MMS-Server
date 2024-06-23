import { RowDataPacket } from "mysql2";

export interface AssetId extends RowDataPacket {
    id: number
}

export interface Asset extends RowDataPacket {
    id: number;
    parentId: number;
    name: string;
    breadcrumbs: number[];
    children: null | [];
}

export interface AssetById extends RowDataPacket {
    id: number;
    parent_id: number;
    facility_id: number;
    name: string;
    revenue: number;
    notes: string;
    grand_parent_id: number;
    parent_name: string;
}

export interface AssetRevenues extends RowDataPacket {
    id: number;
    name: string;
    revenue: number;
}

export interface AssetRelationBasic extends RowDataPacket {
    descendant_id: number;
}