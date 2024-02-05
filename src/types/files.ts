import { RowDataPacket } from 'mysql2';

export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    destination: string;
    filename: string;
    path: string;
    size: number;
}

export interface MappedFiles extends RowDataPacket {
    id: number;
    name: string;
}

export interface FileLocation extends RowDataPacket {
    file_name: string;
    destination: string;
    location_name: string;
}

export interface FileName extends RowDataPacket {
    id: string;
    file_name: string;
}