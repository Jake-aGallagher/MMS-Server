import { RowDataPacket, FieldPacket } from 'mysql2';
import db from '../database/database';

export async function getAllSpares(propertyId: number) {
    const data = await db.execute(
        `SELECT 
            id,
            part_no,
            man_part_no,
            name,
            man_name,
            description,
            notes,
            location,
            quant_remain,
            supplier,
            reorder_freq,
            reorder_num,
            running_low,
            avg_usage,
            cost
        FROM 
            spares
        WHERE
            property_id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function getAllSparesBasic(propertyId: number) {
    const data = await db.execute(
        `SELECT 
            id,
            part_no,
            name
        FROM 
            spares
        WHERE
            property_id = ?
        ORDER BY
            part_no
        DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getSpares(id: number) {
    const data = await db.execute(
        `SELECT 
            id,
            part_no,
            man_part_no,
            name,
            man_name,
            description,
            notes,
            location,
            quant_remain,
            supplier,
            reorder_freq,
            reorder_num,
            running_low,
            avg_usage,
            cost
        FROM 
            spares
        WHERE
            id = ?;`,
        [id]
    );
    return data[0];
}

interface CurrentStock extends RowDataPacket {
    id: number;
    quant_remain: number;
}

export async function getCurrentSpecificStock(stockChangeIds: number[], propertyId: number) {
    const data: [CurrentStock[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            quant_remain
        FROM
            spares
        WHERE
            id IN (${stockChangeIds})
        AND
            property_id = ?;`,
        [propertyId]
    );
    return data[0];
}

interface UsedSpares extends RowDataPacket {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

export async function getUsedSpares(jobId: number) {
    const data: [UsedSpares[], FieldPacket[]] = await db.execute(
        `SELECT 
            spares.id,
            spares.part_no,
            spares.name,
            spares_used.num_used
        FROM 
            spares_used
        INNER JOIN spares ON
            (
                spares_used.spare_id = spares.id
            )
        WHERE
            job_id = ?;`,
        [jobId]
    );
    return data[0];
}

interface recentlyUsed extends RowDataPacket {
    spare_id: number;
    total_used: number;
}

export async function getUsedRecently(propertyId: number, monthsOfData: number) {
    const data: [recentlyUsed[], FieldPacket[]] = await db.execute(
        `SELECT
            spare_id,
            SUM(num_used) AS total_used
        FROM
            spares_used
        WHERE
            property_id = ?
        AND
            date_used > DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY
            spare_id`,
        [propertyId, monthsOfData]
    );
    return data[0];
}

interface ExtendedStock extends CurrentStock {
    part_no: string;
    name: string;
    supplier: string;
}

export async function getSparesRemaining(propertyId: number) {
    const data: [ExtendedStock[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            part_no,
            name,
            supplier,
            quant_remain
        FROM
            spares
        WHERE
            property_id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function getSuppliers(propertyId: number) {
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
            property_id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function getSupplierInfo(supplierId: number) {
    const data = await db.execute(
        `SELECT
            *
        FROM
            suppliers
        WHERE
            id = ?;`,
        [supplierId]
    );
    return data[0];
}

export async function getSparesNotes(propertyId: number) {
    const data = await db.execute(
        `SELECT
            id,
            title,
            content,
            DATE_FORMAT(created, "%d/%m/%y") AS 'created_date'
        FROM
            spares_notes
        WHERE
            property_id = ?
        ORDER BY
            created
        DESC;`,
        [propertyId]
    );
    return data[0];
}

export async function getNote(noteId: number) {
    const data = await db.execute(
        `SELECT
            id,
            title,
            content
        FROM
            spares_notes
        WHERE
            id = ?;`,
        [noteId]
    );
    return data[0];
}

interface NewSpares {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

export async function insertUsedSpares(sparesUsed: NewSpares[], jobId: number, property_id: number) {
    let sql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            job_id,
            num_used,
            date_used,
            property_id
        )
    VALUES`;

    for (let i = 0; i < sparesUsed.length; i++) {
        if (i == sparesUsed.length - 1) {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW(), ${property_id})`;
        } else {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW(), ${property_id}),`;
        }
    }
    sql += `;`;

    const response = await db.execute(sql);
    return response[0];
}

export async function updateUsedSpares(sparesUsed: NewSpares[], jobId: number, property_id: number) {
    let sql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            job_id,
            num_used,
            date_used,
            property_id
        )
    VALUES`;

    for (let i = 0; i < sparesUsed.length; i++) {
        if (i == sparesUsed.length - 1) {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW(), ${property_id})`;
        } else {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW(), ${property_id}),`;
        }
    }

    sql += `
    AS newSpare
    ON DUPLICATE KEY UPDATE
        num_used = newSpare.num_used,
        date_used = NOW();`;

    const response = await db.execute(sql);
    return response[0];
}

export async function updateStock(stockArray: { id: number; property_id: number; quant_remain: number }[]) {
    let errors = false;

    stockArray.forEach(async (item) => {
        const response = await db.execute(`
        UPDATE
            spares
        SET
            quant_remain = ${item.quant_remain}
        WHERE
            id = ${item.id}
        AND
            property_id = ${item.property_id};`);
        // @ts-ignore
        if (response[0].affectedRows != 1) {
            errors = true;
        }
    });
    return errors;
}

interface AddEditSupplier {
    propertyId: number;
    id: number;
    name: string;
    website: string;
    phone: string;
    primContact: string;
    primContactPhone: string;
    address: string;
    city: string;
    county: string;
    postcode: string;
    supplies: string;
}

export async function addSupplier(s: AddEditSupplier) {
    const response = await db.execute(
        `INSERT INTO
            suppliers
            (name, website, phone, prim_contact, prim_contact_phone, address, city, county, postcode, supplies, property_id)
        VALUES
            (?,?,?,?,?,?,?,?,?,?,?);`,
        [s.name, s.website, s.phone, s.primContact, s.primContactPhone, s.address, s.city, s.county, s.postcode, s.supplies, s.propertyId]
    );
    return response[0];
}

export async function editSupplier(s: AddEditSupplier) {
    const response = await db.execute(
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

interface AddEditSpare {
    partNo: string;
    manPartNo: string;
    name: string;
    manName: string;
    description: string;
    notes: string;
    location: string;
    quantRemaining: number;
    supplier: string;
    cost: number;
    propertyId: number;
    id: number;
}

export async function addSpare(s: AddEditSpare) {
    const response = await db.execute(
        `INSERT INTO
            spares
            (part_no, man_part_no, name, man_name, description, notes, location, quant_remain, supplier, cost, property_id)
        VALUES
            (?,?,?,?,?,?,?,?,?,?,?);`,
        [s.partNo, s.manPartNo, s.name, s.manName, s.description, s.notes, s.location, s.quantRemaining, s.supplier, s.cost, s.propertyId]
    );
    return response[0];
}

export async function editSpare(s: AddEditSpare) {
    const response = await db.execute(
        `UPDATE
            spares
        SET
            part_no = ?,
            man_part_no = ?,
            name = ?,
            man_name = ?,
            description = ?,
            notes = ?,
            location = ?,
            quant_remain = ?,
            supplier = ?,
            cost = ?,
            property_id = ?
        WHERE
            id = ?;`,
        [s.partNo, s.manPartNo, s.name, s.manName, s.description, s.notes, s.location, s.quantRemaining, s.supplier, s.cost, s.propertyId, s.id]
    );
    return response[0];
}

export async function postSparesNote(body: { propertyId: string; title: string; note: string; noteId: number }) {
    let response;
    if (body.noteId === 0) {
        response = await db.execute(
            `INSERT INTO
                spares_notes
                (
                    property_id,
                    title,
                    content,
                    created
                )
            VALUES
                (?,?,?,NOW());`,
            [body.propertyId, body.title, body.note]
        );
    } else {
        response = await db.execute(
            `UPDATE
                spares_notes
            SET
                title = ?,
                content = ?,
                created = NOW()
            WHERE
                id = ?;`,
            [body.title, body.note, body.noteId]
        );
    }

    return response[0];
}

export async function deleteSupplier(body: { id: string}) {
    const response = await db.execute(
        `DELETE FROM
            suppliers
        WHERE
            id = ?;`,
        [body.id]
    );
    return response[0];
}

export async function deleteNote(body: { id: string }) {
    const response = await db.execute(
        `DELETE FROM
            spares_notes
        WHERE
            id = ?;`,
        [body.id]
    );
    return response[0];
}
