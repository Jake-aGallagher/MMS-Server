import getConnection from '../../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { AssetById, Asset, AssetId, AssetRevenues } from '../../types/maintenance/assets';

export async function getAssetTree(client: string, facilityId: number, rootId: number) {
    const db = await getConnection('client_' + client);
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
            relations.facility_id = ?
        )
        INNER JOIN assets AS find_root ON
        (
            find_root.id = relations.ancestor_id
            AND
            find_root.facility_id = ?
            AND
            find_root.deleted = 0
        )
        INNER JOIN assets_relations AS crumbs ON
        (
            crumbs.descendant_id = relations.descendant_id
            AND
            crumbs.facility_id = ?
        )
        WHERE
            find_root.parent_id = ?
        AND
            assets.facility_id = ?
        AND
            assets.deleted = 0
        GROUP BY
            assets.id
        ORDER BY
            breadcrumbs;`,
        [facilityId, facilityId, facilityId, rootId, facilityId]
    );
    return data[0];
}

export async function getAssetRoot(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
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
            facility_id = ?;`,
        [facilityId]
    );
    return data[0];
}

export async function getAssetById(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const data: [AssetById[], FieldPacket[]] = await db.execute(
        `SELECT
            assets.id AS id,
            assets.parent_id AS parent_id,
            assets.facility_id AS facility_id,
            assets.name AS name,
            assets.revenue AS revenue,
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

export async function getAssetsWithRevenues(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data: [AssetRevenues[], FieldPacket[]] = await db.execute(
        `SELECT
            assets.id,
            assets.name,
            assets.revenue
        FROM
            assets
        WHERE
            assets.facility_id = ?
        AND
            assets.deleted = 0
        AND
            assets.revenue IS NOT NULL;`,
        [facilityId]
    );
    return data[0];

}

export async function insertAsset(client: string, parentId: number, facilityId: number, name: string, note: string, revenue: number | null) {
    const db = await getConnection('client_' + client);
    const revenuePerMin = revenue && revenue > 0 ? revenue : null;
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            assets
            (
                parent_id,
                facility_id,
                name,
                notes,
                revenue
            )
        VALUES
            ( ?, ?, ?, ?, ? );`,
        [parentId, facilityId, name, note, revenuePerMin]
    );
    return data[0];
}

export async function editAsset(client: string, id: number, name: string, note: string, revenue: number | null) {
    const db = await getConnection('client_' + client);
    const revenuePerMin = revenue && revenue > 0 ? revenue : null;
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            assets
        SET
            name = ?,
            notes = ?,
            revenue = ?
        WHERE
            id = ?;`,
        [name, note, revenuePerMin, id]
    );
    return data[0];
}

export async function renameRootAsset(client: string, name: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            assets
        SET
            name = ?
        WHERE
            facility_id = ?
        AND
            parent_id = 0;`,
        [name, facilityId]
    );
    return data[0];
}

export async function deleteAsset(client: string, assetIds: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(`UPDATE assets SET deleted = 1, deleted_date = NOW() WHERE id IN (?);`, [assetIds]);
    const data: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return data[0];
}
