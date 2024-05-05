import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import { FileDetails, FileName, FileUpload, MappedFiles } from '../types/files';
import Hashids from 'hashids';

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

export async function getFieldFileData(fileIds: string[], fileToFieldMap: {[key:string]: number}) {
    const sql = db.format(
        `SELECT
            id,
            file_name
        FROM
            files
        WHERE
            id IN (?)
        AND
            deleted = 0;`,
        [fileIds]
    );
    const data: [FileName[], FieldPacket[]] = await db.execute(sql);

    const hashIds = new Hashids('file', 8);
    const fileObj: {[key:string]: { id: string; encodedId: string; name: string }[]} = {};

    data[0].forEach((item) => {
        const hashedId = hashIds.encode(item.id);
        if (!fileObj[fileToFieldMap[item.id]]) {
            fileObj[fileToFieldMap[item.id]] = [{ id: item.id, encodedId: hashedId, name: item.file_name }];
        } else {
            fileObj[fileToFieldMap[item.id]].push({ id: item.id, encodedId: hashedId, name: item.file_name });
        }
    });

    return fileObj;
}

export async function getFileDetails(id: number | BigInt) {
    const data: [FileDetails[], FieldPacket[]] = await db.execute(
        `SELECT
            file_name,
            location_name
        FROM
            files
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0][0];
}

export async function postFile(file: FileUpload) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            files
            (
                file_name,
                mime_type,
                location_name,
                size
            )
        VALUES
            (?,?,?,?);`,
        [file.originalname, file.mimetype, file.blobName, file.blobSize]
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
    return;
}
