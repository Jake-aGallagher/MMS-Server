import { RowDataPacket, FieldPacket } from 'mysql2';
import db from '../database/database';

interface Asset extends RowDataPacket {
    id: number;
    parentId: number;
    name: string;
    breadcrumbs: number[];
    children: null;
}

export async function getAssetTree(propertyId: number, rootId: number) {
    const data: [Asset[], FieldPacket[]] = await db.execute(
        `SELECT
            assets.id,
            assets.parent_id AS parentId,
            assets.name AS name,
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
        GROUP BY
            assets.id
        ORDER BY
            breadcrumbs;`,
        [propertyId, propertyId, propertyId, rootId, propertyId]
    );
    return data[0];
}

interface AssetById extends RowDataPacket {
    id: number;
    parent_id: number;
    property_id: number;
    name: string;
    notes: string;
    grand_parent_id: number;
    parent_name: string;
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
            )
        WHERE
            assets.id = ?;`,
        [id]
    );
    return data[0];
}

export async function insertAsset(parentId: number, propertyId: number, name: string) {
    const data = await db.execute(
        `INSERT INTO
            assets
            (
                parent_id,
                property_id,
                name
            )
        VALUES
            (
                ?,
                ?,
                ?
            );`,
        [parentId, propertyId, name]
    );
    return data[0];
}

export async function renameAsset(id: number, name: string) {
    const data = await db.execute(
        `UPDATE
            assets
        SET
            name = ?
        WHERE
            id = ?;`,
        [name, id]
    );
    return data[0];
}

export async function deleteAsset(assetIds: number[]) {
    const data = await db.execute(
        `DELETE FROM
            assets
        WHERE
            id IN (${assetIds});`
    );
    return data[0];
}