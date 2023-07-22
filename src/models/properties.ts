import { FieldPacket, ResultSetHeader } from 'mysql2';
import { UserIdOnly } from '../types/users';
import { PropertyId, PropertyBasics, Property, AssignedBasic, Assigned } from '../types/properties';
import db from '../database/database';

export async function getAllPropertyIds() {
    const data: [PropertyId[], FieldPacket[]] = await db.execute(
        `SELECT
             id
        FROM
            properties;`
    );
    return data[0];
}

export async function getAllProperties() {
    const response: [Property[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             name,
             type,
             address,
             city,
             county,
             postcode
        FROM
            properties
        ORDER BY
            name;`
    );
    return response[0];
}

export async function getAllPropertiesForUser(userId: number) {
    const data: [PropertyBasics[], FieldPacket[]] = await db.execute(
        `SELECT 
            properties.id,
            properties.name
        FROM 
            properties
        INNER JOIN
            property_users ON
            (
                properties.id = property_users.property_id
            )
        WHERE
            property_users.user_id = ?;`,
        [userId]
    );
    return data[0];
}

export async function getLastPropertyForUser(userId: number) {
    const data: [PropertyBasics[], FieldPacket[]] = await db.execute(
        `SELECT 
            property_id
        FROM 
            last_property
        WHERE
            user_id = ?;`,
        [userId]
    );
    return data[0];
}

export async function getPropertyDetails(propertyId: number) {
    const data = await db.execute(
        `SELECT 
            id,
            name,
            type,
            address,
            city,
            county,
            postcode
        FROM 
            properties
        WHERE
            id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function getAssignedUsers(propertyId: number) {
    const data = await db.execute<Assigned[]>(
        `SELECT 
            users.id AS id,
            users.username AS username,
            users.first_name AS first_name,
            users.last_name AS last_name,
            users.user_group_id AS user_group_id,
            user_groups.name AS user_group_name
        FROM 
            users
        LEFT JOIN property_users ON
        (
            users.id = property_users.user_id
        )
        INNER JOIN user_groups ON
        (
            users.user_group_id = user_groups.id
        )
        WHERE
            property_id = ?
        OR
            users.user_group_id = '1'
        GROUP BY
            users.id
        ORDER BY
            user_group_id
        DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getAssignedUserIds(propertyId: number) {
    const data = await db.execute<AssignedBasic[]>(
        `SELECT 
            users.id AS id
        FROM 
            users
        LEFT JOIN property_users ON
        (
            users.id = property_users.user_id
        )
        WHERE
            property_id = ?
        OR
            users.user_group_id = '1'
        GROUP BY
            users.id
        ORDER BY
            user_group_id
        DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function postProperty(body: { name: string; type: string; address: string; city: string; county: string; postcode: string }) {
    const name = body.name;
    const type = body.type;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
          properties
          (
              name,
              type,
              address,
              city,
              county,
              postcode
          )
      VALUES
          (?,?,?,?,?,?);`,
        [name, type, address, city, county, postcode]
    );
    return response[0];
}

export async function editProperty(body: { id: string; name: string; type: string; address: string; city: string; county: string; postcode: string }) {
    const id = parseInt(body.id);
    const name = body.name;
    const type = body.type;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            properties
        SET
            name = ?,
            type = ?,
            address = ?,
            city = ?,
            county = ?,
            postcode = ?
        WHERE
            id = ?;`,
        [name, type, address, city, county, postcode, id]
    );
    return response[0];
}

export async function setAssignedUsers(propertyNo: number, userIds: UserIdOnly[]) {
    const res: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE
            property_users
        FROM
            property_users
        INNER JOIN users ON
            (
                property_users.user_id = users.id
            )
        WHERE
            Property_id = ?
        AND
            users.user_group_id != '1';`,
        [propertyNo]
    );
    if (res && userIds.length > 0) {
        let sql = `
            INSERT INTO
                    property_users
                    (
                        property_id,
                        user_id
                    )
                VALUES`;

        for (let i = 0; i < userIds.length; i++) {
            if (i == userIds.length - 1) {
                sql += `(${propertyNo}, ${userIds[i]})`;
            } else {
                sql += `(${propertyNo}, ${userIds[i]}),`;
            }
        }
        sql += `;`;
        const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
        return response[0];
    } else if (res) {
        return res[0];
    }
}

export async function postLastProperty(body: { userId: string; propertyId: string }) {
    const userId = body.userId;
    const propertyId = body.propertyId;
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            last_property
            (
                user_id,
                property_id
            )
        VALUES
            (?,?)
        ON DUPLICATE KEY UPDATE
            property_id = ?;`,
        [userId, propertyId, propertyId]
    );
    return response[0];
}

export async function postAdminAssignments(userId: number, propertyIds: { id: number }[]) {
    let sql = `INSERT INTO
            property_users
            (
                property_id,
                user_id
            )
        VALUES`;

    for (let i = 0; i < propertyIds.length; i++) {
        if (i < propertyIds.length - 1) {
            sql += `('${propertyIds[i].id}', '${userId}'),`;
        } else {
            sql += `('${propertyIds[i].id}', '${userId}');`;
        }
    }

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}

export async function deleteAssignments(userId: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            property_users
        WHERE
            user_id = ?;`,
        [userId]
    );
    return response[0];
}
