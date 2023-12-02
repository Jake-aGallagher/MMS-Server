import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import { FileLocation, FileUpload, MappedFiles } from '../types/files';

export async function getMappedFiles(modelType: string, modelId: number) {
    const data: [MappedFiles[], FieldPacket[]] = await db.execute(
        `SELECT
            files.id,
            files.file_name
        FROM
            files
        INNER JOIN file_mappings ON
        (
            file_mappings.from_id = files.id
            AND
            file_mappings.to_type = ?
            AND
            file_mappings.to_id = ?
            AND
            file_mappings.deleted = 0
        )
        WHERE
            files.deleted = 0;`,
        [modelType, modelId]
    );
    return data[0];
}

export async function getFilePath(id: number | BigInt) {
    const data: [FileLocation[], FieldPacket[]] = await db.execute(
        `SELECT
            file_name,
            destination,
            location_name
        FROM
            files
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0]
}

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

    let values = [];
    for (let i = 0; i < fromIds.length; i++) {
        values.push(`('${fromType}', ${fromIds[i]}, '${toType}', ${toId})`);
    }
    sql += values.join(',') + `;`;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}

export async function deleteFile(id: number | BigInt) {
    await db.execute(`UPDATE files SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    await db.execute(`UPDATE file_mappings SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return
}