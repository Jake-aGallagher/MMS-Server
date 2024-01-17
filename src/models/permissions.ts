import db from '../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { AllPermissions, GroupPermissions, GroupPermObj } from '../types/permissions';

export async function getAllPermissions() {
    const data: [AllPermissions[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             area,
             permission,
             full_string
        FROM
            permissions;`
    );
    return data[0];
}

export async function getPermissionsForGroup(id: number) {
    const data: [GroupPermissions[], FieldPacket[]] = await db.execute(
        `SELECT
             permission_id AS id
        FROM
            permission_mappings
        WHERE
            user_group_id = ?;`,
        [id]
    );
    return data[0];
}

export async function getPermissionObj(id: number) {
    const data: [GroupPermObj[], FieldPacket[]] = await db.execute(
        `SELECT
             permissions.area,
             permissions.permission
        FROM
            permission_mappings
        INNER JOIN permissions ON
        (
            permissions.id = permission_mappings.permission_id
        )
        WHERE
            user_group_id = ?;`,
        [id]
    );
    const permObj = <{ [key: string]: { [key: string]: boolean } }>{};
    data[0].forEach((item) => {
        if (!permObj[item.area]) {
            permObj[item.area] = {};
        }
        permObj[item.area][item.permission] = true;
    });
    return permObj;
}

export async function setPermissionsForGroup(userGroupId: number, permissions: string[]) {
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
            `DELETE FROM
                permission_mappings
            WHERE
                user_group_id = ?;`,
            [userGroupId]
        );
        if (permissions.length > 0) {
            let sql = `INSERT INTO
                permission_mappings
                (
                    permission_id,
                    user_group_id
                )
            VALUES`;

            let values = [];
            for (let i = 0; i < permissions.length; i++) {
                values.push(`(${permissions[i]}, ${userGroupId})`);
            }
            sql += values.join(',') + `;`;
            await conn.execute(sql);
        }
        await conn.commit();
        conn.release();
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
}
