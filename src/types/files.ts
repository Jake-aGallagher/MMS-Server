import { RowDataPacket } from 'mysql2';

export interface FileUpload {
    fieldname?: string,
    originalname: string,
    encoding?: string,
    mimetype: string,
    url?: string,    
    blobName: string,
    etag?: string,
    blobType?: string,
    metadata?: {},
    container?: string,
    blobSize: string
}

export interface MappedFiles extends RowDataPacket {
    id: number;
    name: string;
}

export interface FileDetails extends RowDataPacket {
    file_name: string;
    location_name: string;
}

export interface FileName extends RowDataPacket {
    id: string;
    file_name: string;
}