import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
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
    const res: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE
            permission_mappings
        FROM
            permission_mappings
        WHERE
            user_group_id = ?;`,
        [userGroupId]
    );
    if (res && permissions.length > 0) {
        let sql = `
            INSERT INTO
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

        const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
        return response[0];
    } else if (res) {
        return res[0];
    }
}
