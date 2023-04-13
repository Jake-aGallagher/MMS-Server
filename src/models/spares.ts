import { FieldPacket } from 'mysql2';
import {
    CurrentStock,
    UsedSpares,
    recentlyUsed,
    ExtendedStock,
    NewSpares,
    AddEditSupplier,
    Delivery,
    DeliveryItem,
    DeliveryItems,
    AddEditSpare,
    SparesDetails,
} from '../types/spares';
import db from '../database/database';

export async function getAllSpares(propertyId: number) {
    const data: [SparesDetails[], FieldPacket[]] = await db.execute(
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

export async function getSparesRemainingToBeDelivered(deliveryId: number) {
    const data: [CurrentStock[], FieldPacket[]] = await db.execute(
        `SELECT
            spares.id,
            spares.quant_remain
        FROM
            spares
        INNER JOIN delivery_items ON
        (
            delivery_items.spare_id = spares.id
        ) 
        WHERE
            delivery_items.delivery_id = ?;`,
        [deliveryId]
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

export async function getDeliveries(propertyId: number) {
    const data: [Delivery[], FieldPacket[]] = await db.execute(
        `SELECT
            deliveries.id,
            deliveries.name,
            suppliers.name AS supplier,
            deliveries.courier,
            DATE_FORMAT(deliveries.placed, "%d/%m/%y") AS placed,
            DATE_FORMAT(deliveries.due, "%d/%m/%y") AS due,
            deliveries.arrived
        FROM
            deliveries
        INNER JOIN suppliers ON
        (
            suppliers.id = deliveries.supplier
        )
        WHERE
            deliveries.property_id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function getDeliveryById(deliveryId: number) {
    const data: [Delivery[], FieldPacket[]] = await db.execute(
        `SELECT
            deliveries.id,
            deliveries.name,
            deliveries.supplier,
            deliveries.courier,
            deliveries.placed,
            deliveries.due,
            deliveries.arrived
        FROM
            deliveries
        WHERE
            deliveries.id = ?;`,
        [deliveryId]
    );
    return data[0];
}

export async function getDeliveryItems(deliveryIds: number[]) {
    const data: [DeliveryItem[], FieldPacket[]] = await db.execute(
        `SELECT
            delivery_items.delivery_id,
            delivery_items.spare_id,
            delivery_items.quantity,
            spares.part_no,
            spares.name
        FROM
            delivery_items
        INNER JOIN spares ON
        (
            spares.id = delivery_items.spare_id
        )
        WHERE
            delivery_id IN (${deliveryIds});`,
        [deliveryIds]
    );
    return data[0];
}

export async function addDelivery(d: Delivery) {
    const response = await db.execute(
        `INSERT INTO
            deliveries
            (name, supplier, courier, placed, due, property_id, arrived)
        VALUES
            (?, ?, ?, ?, ?, ?, ?);`,
        [d.name, d.supplier, d.courier, d.placed, d.due, d.propertyId, (d.arrived? 1 : 0)]
    );
    return response[0];
}

export async function addDeliveryItems(deliveryId: number, items: DeliveryItems[]) {
    let sql = `
    INSERT INTO
        delivery_items
        (
            delivery_id,
            spare_id,
            quantity
        )
    VALUES`;

    for (let i = 0; i < items.length; i++) {
        sql += `(${deliveryId}, ${items[i].id}, ${items[i].num_used})`;
        if (i !== items.length - 1) {
            sql += ',';
        }
    }

    sql += `;`;

    const response = await db.execute(sql);
    return response[0];
}

export async function editDelivery(d: Delivery) {
    const response = await db.execute(
        `UPDATE
            deliveries
        SET
            name = ?,
            supplier = ?,
            courier = ?,
            placed = ?,
            due = ?,
            property_id = ?,
            arrived = ?
        WHERE
            id = ?;`,
        [d.name, d.supplier, d.courier, d.placed, d.due, d.propertyId, (d.arrived? 1 : 0), d.id]
    );
    return response[0];
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

export async function adjustSpareStock(id: number, newStockLevel: number) {
    const response = await db.execute(
        `UPDATE
            spares
        SET
            quant_remain = ?
        WHERE
            id = ?;`,
        [newStockLevel, id]
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

export async function deleteSupplier(body: { id: string }) {
    const response = await db.execute(
        `DELETE FROM
            suppliers
        WHERE
            id = ?;`,
        [body.id]
    );
    return response[0];
}

export async function deleteSparesItem(body: { id: string }) {
    const response = await db.execute(
        `DELETE FROM
            spares
        WHERE
            id = ?;`,
        [body.id]
    );
    return response[0];
}

export async function deleteSparesUsed(body: { id: string }) {
    db.execute(
        `DELETE FROM
            spares_used
        WHERE
            spare_id = ?;`,
        [body.id]
    );
    return;
}

export async function deleteDelivery(deliveryId: number) {
    const response = await db.execute(
        `DELETE FROM
            deliveries
        WHERE
            id = ?;`,
        [deliveryId]
    );
    return response[0];
}

export async function deleteDeliveryContents(deliveryId: number) {
    const response = await db.execute(
        `DELETE FROM
            delivery_items
        WHERE
            delivery_id = ?;`,
        [deliveryId]
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
