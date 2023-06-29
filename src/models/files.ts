import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import { FileUpload } from '../types/files';

export async function postFile(file: FileUpload) {

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            files
            (
                file_name,
                mime_type,
                destination,
                location_name,
                size
            )
        VALUES
            (?,?,?,?,?);`,
        [file.originalname, file.mimetype, file.destination, file.filename, file.size]
    );
    return response[0];
}

export async function postFileMappings(fromType: string, fromIds: number[], toType: string, toId: number) {
    let sql = `
        INSERT INTO
            file_mappings
            (
                from_type,
                from_id,
                to_type,
                to_id
            )
        VALUES`;

    for (let i = 0; i < fromIds.length; i++) {
        sql += `
            ('${fromType}', ${fromIds[i]}, '${toType}', ${toId})${i == (fromIds.length -1) ? ';' : ','}`;
    }

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}