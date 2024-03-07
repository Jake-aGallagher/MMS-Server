import { FieldPacket, ResultSetHeader } from 'mysql2';
import { AssetById, Asset, AssetId } from '../types/assets';
import db from '../database/database';

export async function getAssetTree(propertyId: number, rootId: number) {
    const data: [Asset[], FieldPacket[]] = await db.execute(
        `SELECT
            assets.id,
            assets.parent_id AS parentId,
            assets.name AS name,
            assets.notes AS note,
            GROUP_CONCAT(crumbs.ancestor_id) AS breadcrumbs,
            NULL AS children
        FROM
            assets
        INNER JOIN assets_relations AS relations ON
        (
            assets.id = relations.descendant_id
            AND
            relations.property_id = ?
        )
        INNER JOIN assets AS find_root ON
        (
            find_root.id = relations.ancestor_id
            AND
            find_root.property_id = ?
            AND
            find_root.deleted = 0
        )
        INNER JOIN assets_relations AS crumbs ON
        (
            crumbs.descendant_id = relations.descendant_id
            AND
            crumbs.property_id = ?
        )
        WHERE
            find_root.parent_id = ?
        AND
            assets.property_id = ?
        AND
            assets.deleted = 0
        GROUP BY
            assets.id
        ORDER BY
            breadcrumbs;`,
        [propertyId, propertyId, propertyId, rootId, propertyId]
    );
    return data[0];
}

export async function getAssetRoot(propertyId: number) {
    const data: [AssetId[], FieldPacket[]] = await db.execute(
        `SELECT
            id
        FROM
            assets
        WHERE
            parent_id = 0
        AND
            deleted = 0
        AND
            property_id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function getAssetById(id: number) {
    const data: [AssetById[], FieldPacket[]] = await db.execute(
        `SELECT
            assets.id AS id,
            assets.parent_id AS parent_id,
            assets.property_id AS property_id,
            assets.name AS name,
            assets.notes AS notes,
            parent.parent_id AS grand_parent_id,
            parent.name AS parent_name
        FROM
            assets
        LEFT JOIN assets AS parent ON
            (
                parent.id = assets.parent_id
                AND
                parent.deleted = 0
            )
        WHERE
            assets.id = ?
        AND
            assets.deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function insertAsset(parentId: number, propertyId: number, name: string, note: string) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            assets
            (
                parent_id,
                property_id,
                name,
                notes
            )
        VALUES
            (
                ?,
                ?,
                ?,
                ?
            );`,
        [parentId, propertyId, name, note]
    );
    return data[0];
}

export async function editAsset(id: number, name: string, note: string) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            assets
        SET
            name = ?,
            notes = ?
        WHERE
            id = ?;`,
        [name, note, id]
    );
    return data[0];
}

export async function renameRootAsset(name: string, propertyId: number) {
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            assets
        SET
            name = ?
        WHERE
            property_id = ?
        AND
            parent_id = 0;`,
        [name, propertyId]
    );
    return data[0];
}

export async function deleteAsset(assetIds: number[]) {
    const sql = db.format(`UPDATE assets SET deleted = 1, deleted_date = NOW() WHERE id IN (?);`, [assetIds]);
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return data[0];
}
