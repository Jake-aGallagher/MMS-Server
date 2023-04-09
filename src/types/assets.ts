import { RowDataPacket } from "mysql2";

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
    property_id: number;
    name: string;
    notes: string;
    grand_parent_id: number;
    parent_name: string;
}

export interface AssetRelationBasic extends RowDataPacket {
    descendant_id: number;
}