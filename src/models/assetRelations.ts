import { RowDataPacket, FieldPacket } from 'mysql2';
import db from '../database/database';

interface AssetRelationBasic extends RowDataPacket {
    descendant_id: number;
}

export async function insertChild(assetId: number, propertyId: number, assetParentId: number) {
    const data = await db.execute(
        `INSERT INTO
            assets_relations
            (
                ancestor_id,
                descendant_id,
                depth,
                property_id
            )
        SELECT
            ancestor_id,
            ?,
            (depth + 1),
            property_id
        FROM
            assets_relations
        WHERE
            property_id = ?
        AND
            descendant_id = ?;`,
        [assetId, propertyId, assetParentId]
    );
    return data[0];
}

export async function insertSelf(assetId: number, propertyId: number) {
    const data = await db.execute(
        `INSERT INTO
            assets_relations
            (
                ancestor_id,
                descendant_id,
                depth,
                property_id
            )
        VALUES
            (
                ?,
                ?,
                '0',
                ?
            );`,
        [assetId, assetId, propertyId]
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
    const data = await db.execute(
        `DELETE FROM
            assets_relations
        WHERE
            descendant_id IN (${assetIds});`
    );
    return data[0];
}