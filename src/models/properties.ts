import { FieldPacket, ResultSetHeader } from 'mysql2';
import { UserIdOnly } from '../types/users';
import { PropertyId, PropertyBasics, Property, AssignedBasic, Assigned } from '../types/properties';
import db from '../database/database';

export async function getAllPropertyIds() {
    const data: [PropertyId[], FieldPacket[]] = await db.execute(
        `SELECT
             id
        FROM
            properties
        WHERE
            deleted = 0;`
    );
    return data[0];
}

export async function getAllProperties() {
    const response: [Property[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             name,
             address,
             city,
             county,
             postcode
        FROM
            properties
        WHERE
            deleted = 0
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
            property_users.user_id = ?
        AND
            deleted = 0;`,
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
        INNER JOIN properties ON
        (
            properties.id = last_property.property_id
            AND
            properties.deleted = 0
        )
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
            address,
            city,
            county,
            postcode
        FROM 
            properties
        WHERE
            id = ?
        AND
            deleted = 0;`,
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
        (
            property_id = ?
            OR
            users.user_group_id = '1'
        )
        AND
            users.deleted = 0
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
        (
            property_id = ?
            OR
            users.user_group_id = '1'
        )
        AND
            users.deleted = 0
        GROUP BY
            users.id
        ORDER BY
            user_group_id
        DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function postProperty(body: { name: string; address: string; city: string; county: string; postcode: string }) {
    const name = body.name;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
          properties
          (
              name,
              address,
              city,
              county,
              postcode
          )
      VALUES
          (?,?,?,?,?);`,
        [name, address, city, county, postcode]
    );
    return response[0];
}

export async function editProperty(body: { id: string; name: string; address: string; city: string; county: string; postcode: string }) {
    const id = parseInt(body.id);
    const name = body.name;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            properties
        SET
            name = ?,
            address = ?,
            city = ?,
            county = ?,
            postcode = ?
        WHERE
            id = ?;`,
        [name, address, city, county, postcode, id]
    );
    return response[0];
}

export async function setAssignedUsers(propertyNo: number, userIds: UserIdOnly[]) {
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
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
        if (userIds.length > 0) {
            let sql = `INSERT INTO
                property_users
                (
                    property_id,
                    user_id
                )
            VALUES`;

            let values = [];
            for (let i = 0; i < userIds.length; i++) {
                values.push(`(${propertyNo}, ${userIds[i]})`);
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
    let sql = `
        INSERT INTO
            property_users
            (
                property_id,
                user_id
            )
        VALUES`;

    let values = [];
    for (let i = 0; i < propertyIds.length; i++) {
        values.push(`('${propertyIds[i].id}', '${userId}')`);
    }
    sql += values.join(',') + `;`;

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
