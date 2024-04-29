import { FieldPacket, ResultSetHeader } from 'mysql2';
import { AssetRelationBasic } from '../types/assets';
import db from '../database/database';

export async function insertChild(assetId: number, facilityId: number, assetParentId: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            assets_relations
            (
                ancestor_id,
                descendant_id,
                depth,
                facility_id
            )
        SELECT
            ancestor_id,
            ?,
            (depth + 1),
            facility_id
        FROM
            assets_relations
        WHERE
            facility_id = ?
        AND
            descendant_id = ?;`,
        [assetId, facilityId, assetParentId]
    );
    return data[0];
}

export async function insertRoot(assetId: number, facilityId: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            assets_relations
            (
                ancestor_id,
                descendant_id,
                depth,
                facility_id
            )
        VALUES
            (
                '0',
                ?,
                '1',
                ?
            );`,
        [assetId, facilityId]
    );
    return data[0];
}

export async function insertSelf(assetId: number, facilityId: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            assets_relations
            (
                ancestor_id,
                descendant_id,
                depth,
                facility_id
            )
        VALUES
            (
                ?,
                ?,
                '0',
                ?
            );`,
        [assetId, assetId, facilityId]
    );
    return data[0];
}

export async function getChildren(ancestor_id: number) {
    const data: [AssetRelationBasic[], FieldPacket[]] = await db.execute(
        `SELECT
            descendant_id
        FROM
            assets_relations
        WHERE
            ancestor_id = ?;`,
        [ancestor_id]
    );
    return data[0];
}

export async function deleteAssetRelations(assetIds: number[]) {
    if (assetIds.length == 0) {
        return;
    }
    const sql = db.format(`DELETE FROM assets_relations WHERE descendant_id IN (?);`, [assetIds]);
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return data[0];
}
