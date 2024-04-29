import { FieldPacket, ResultSetHeader } from 'mysql2';
import { UserIdOnly } from '../types/users';
import { FacilityId, FacilityBasics, Facility, AssignedBasic, Assigned } from '../types/facilities';
import db from '../database/database';

export async function getAllFacilityIds() {
    const data: [FacilityId[], FieldPacket[]] = await db.execute(
        `SELECT
             id
        FROM
            facilities
        WHERE
            deleted = 0;`
    );
    return data[0];
}

export async function getAllFacilities() {
    const response: [Facility[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             name,
             address,
             city,
             county,
             postcode
        FROM
            facilities
        WHERE
            deleted = 0
        ORDER BY
            name;`
    );
    return response[0];
}

export async function getAllFacilitiesForUser(userId: number) {
    const data: [FacilityBasics[], FieldPacket[]] = await db.execute(
        `SELECT 
            facilities.id,
            facilities.name
        FROM 
            facilities
        INNER JOIN
            facility_users ON
            (
                facilities.id = facility_users.facility_id
            )
        WHERE
            facility_users.user_id = ?
        AND
            deleted = 0;`,
        [userId]
    );
    return data[0];
}

export async function getLastFacilityForUser(userId: number) {
    const data: [FacilityBasics[], FieldPacket[]] = await db.execute(
        `SELECT 
            facility_id
        FROM 
            last_facility
        INNER JOIN facilities ON
        (
            facilities.id = last_facility.facility_id
            AND
            facilities.deleted = 0
        )
        WHERE
            user_id = ?;`,
        [userId]
    );
    return data[0];
}

export async function getFacilityDetails(facilityId: number) {
    const data = await db.execute(
        `SELECT 
            id,
            name,
            address,
            city,
            county,
            postcode
        FROM 
            facilities
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [facilityId]
    );
    return data[0];
}

export async function getAssignedUsers(facilityId: number) {
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
        LEFT JOIN facility_users ON
        (
            users.id = facility_users.user_id
        )
        INNER JOIN user_groups ON
        (
            users.user_group_id = user_groups.id
        )
        WHERE
        (
            facility_id = ?
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
        [facilityId]
    );
    return data[0];
}

export async function getAssignedUserIds(facilityId: number) {
    const data = await db.execute<AssignedBasic[]>(
        `SELECT 
            users.id AS id
        FROM 
            users
        LEFT JOIN facility_users ON
        (
            users.id = facility_users.user_id
        )
        WHERE
        (
            facility_id = ?
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
        [facilityId]
    );
    return data[0];
}

export async function postFacility(body: { name: string; address: string; city: string; county: string; postcode: string }) {
    const name = body.name;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
          facilities
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

export async function editFacility(body: { id: string; name: string; address: string; city: string; county: string; postcode: string }) {
    const id = parseInt(body.id);
    const name = body.name;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            facilities
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

export async function setAssignedUsers(facilityNo: number, userIds: UserIdOnly[]) {
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
            `DELETE
                facility_users
            FROM
                facility_users
            INNER JOIN users ON
                (
                    facility_users.user_id = users.id
                )
            WHERE
                facility_id = ?
            AND
                users.user_group_id != '1';`,
                [facilityNo]
        );
        if (userIds.length > 0) {
            let sql = `
                INSERT INTO
                    facility_users
                    (
                        facility_id,
                        user_id
                    )
                VALUES`;

            let values = [];
            for (let i = 0; i < userIds.length; i++) {
                values.push(`(${facilityNo}, ${userIds[i]})`);
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

export async function postLastFacility(body: { userId: string; facilityId: string }) {
    const userId = body.userId;
    const facilityId = body.facilityId;
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
                last_facility
            (
                user_id,
                facility_id
            )
        VALUES
            (?,?)
        ON DUPLICATE KEY UPDATE
            facility_id = ?;`,
        [userId, facilityId, facilityId]
    );
    return response[0];
}

export async function postAdminAssignments(userId: number, facilityIds: { id: number }[]) {
    let sql = `
        INSERT INTO
            facility_users
            (
                facility_id,
                user_id
            )
        VALUES`;

    let values = [];
    for (let i = 0; i < facilityIds.length; i++) {
        values.push(`('${facilityIds[i].id}', '${userId}')`);
    }
    sql += values.join(',') + `;`;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}

export async function deleteAssignments(userId: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            facility_users
        WHERE
            user_id = ?;`,
        [userId]
    );
    return response[0];
}
