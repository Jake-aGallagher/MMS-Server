import getConnection from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import { AddEditSupplier } from '../types/suppliers';

export async function getSuppliers(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            id,
            name,
            website,
            phone,
            prim_contact,
            prim_contact_phone,
            address,
            city,
            county,
            postcode,
            supplies
        FROM
            suppliers
        WHERE
            facility_id = ?
        AND
            deleted = 0;`,
        [facilityId]
    );
    return data[0];
}

export async function getSupplierInfo(client: string, supplierId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            *
        FROM
            suppliers
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [supplierId]
    );
    return data[0];
}

export async function addSupplier(client: string, s: AddEditSupplier) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            suppliers
            (name, website, phone, prim_contact, prim_contact_phone, address, city, county, postcode, supplies, facility_id)
        VALUES
            (?,?,?,?,?,?,?,?,?,?,?);`,
        [s.name, s.website, s.phone, s.primContact, s.primContactPhone, s.address, s.city, s.county, s.postcode, s.supplies, s.facilityId]
    );
    return response[0];
}

export async function editSupplier(client: string, s: AddEditSupplier) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            suppliers
        SET
            name = ?,
            website = ?,
            phone = ?,
            prim_contact = ?,
            prim_contact_phone = ?,
            address = ?,
            city = ?,
            county = ?,
            postcode = ?,
            supplies = ?
        WHERE
            id = ?;`,
        [s.name, s.website, s.phone, s.primContact, s.primContactPhone, s.address, s.city, s.county, s.postcode, s.supplies, s.id]
    );
    return response[0];
}

export async function deleteSupplier(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE suppliers SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}