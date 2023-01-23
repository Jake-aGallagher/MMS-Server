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