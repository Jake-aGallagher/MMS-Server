import { RowDataPacket } from "mysql2";

// Spares //

export interface UsedSpares extends RowDataPacket {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

export interface recentlyUsed extends RowDataPacket {
    spare_id: number;
    total_used: number;
}

export interface NewSpares {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

export interface NewStock {
    id: number;
    property_id: number;
    quant_remain: number;
}

export interface CurrentStock extends RowDataPacket {
    id: number;
    quant_remain: number;
}

export interface ExtendedStock extends CurrentStock {
    part_no: string;
    name: string;
    supplier: string;
}

export interface AddEditSpare {
    partNo: string;
    manPartNo: string;
    name: string;
    manName: string;
    description: string;
    notes: string;
    location: string;
    quantRemaining: number;
    supplier: string;
    cost: number;
    propertyId: number;
    id: number;
}

export interface WarningArrays {
    id: number;
    part_no: string;
    name: string;
    supplier: string;
    quant_remain: number;
    monthly_usage: number | string;
}
// Deliveries //

export interface Delivery extends RowDataPacket {
    name: string;
    supplier: string;
    courier: string;
    placed: string;
    due: string;
    id: number;
    contents: object[]
}

export interface DeliveryItem extends RowDataPacket {
    delivery_id: number;
    spare_id: number;
    quantity: number;
    part_no: string;
    name: string;
}

export interface DeliveryItems {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

// Suppliers //

export interface AddEditSupplier {
    propertyId: number;
    id: number;
    name: string;
    website: string;
    phone: string;
    primContact: string;
    primContactPhone: string;
    address: string;
    city: string;
    county: string;
    postcode: string;
    supplies: string;
}

