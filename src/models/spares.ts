import { FieldPacket, ResultSetHeader } from 'mysql2';
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
    jobsOfRecentlyUsed,
    UsedSparesIdQuantity,
    CostMapping,
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
            property_id = ?
        AND
            deleted = 0;`,
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
        AND
            deleted = 0
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
            cost
        FROM 
            spares
        WHERE
            id = ?
        AND
            deleted = 0;`,
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
            id IN (?)
        AND
            property_id = ?
        AND
            deleted = 0;`,
        [stockChangeIds.join(','), propertyId]
    );
    return data[0];
}

export async function getUsedSpares(model: string, modelId: number) {
    const data: [UsedSpares[], FieldPacket[]] = await db.execute(
        `SELECT 
            spares.id,
            spares.part_no,
            spares.name,
            CONVERT(SUM(spares_used.quantity), UNSIGNED) as quantity
        FROM 
            spares_used
        INNER JOIN spares ON
            (
                spares_used.spare_id = spares.id
                AND
                spares.deleted = 0
            )
        WHERE
            model = ?
            AND
            model_id = ?
        GROUP BY
            spares_used.spare_id;`,
        [model, modelId]
    );
    return data[0];
}

export async function getUsedRecently(propertyId: number, monthsOfData: number) {
    const data: [recentlyUsed[], FieldPacket[]] = await db.execute(
        `SELECT
            spare_id,
            SUM(quantity) AS total_used
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

export async function getRecentJobsForSpare(propertyId: number, spareId: number) {
    const data: [jobsOfRecentlyUsed[], FieldPacket[]] = await db.execute(
        `SELECT
            model_id
        FROM
            spares_used
        WHERE
            property_id = ?
        AND
            spare_id = ?
        AND
            model = 'job'
        ORDER BY 
            date_used DESC    
        LIMIT
            5`,
        [propertyId, spareId]
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
            property_id = ?
        AND
            deleted = 0;`,
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
            delivery_items.delivery_id = ?
        AND
            deleted = 0;`,
        [deliveryId]
    );
    return data[0];
}

export async function getDeliveryInfoOfSpare(spareId: number, propertyId: number) {
    const data = await db.execute(
        `SELECT
            deliveries.due,
            delivery_items.quantity
        FROM
            deliveries
        INNER JOIN delivery_items ON
        (
            delivery_items.delivery_id = deliveries.id
        )
        WHERE
            delivery_items.spare_id = ?
        AND
            deliveries.property_id = ?
        AND
            deliveries.arrived = 0
        ORDER BY
            deliveries.due
        LIMIT 1;`,
        [spareId, propertyId]
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
            property_id = ?
        AND
            deleted = 0;`,
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
            id = ?
        AND
            deleted = 0;`,
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

export async function getSpareStock(spareId: number) {
    const data = await db.execute(
        `SELECT
            quant_remain
        FROM
            spares
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [spareId]
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

export async function insertUsedSpares(sparesUsed: NewSpares[], model: string, modelId: number, property_id: number) {
    let sql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            model,
            model_id,
            quantity,
            date_used,
            property_id
        )
    VALUES`;

    let values = [];
    for (let i = 0; i < sparesUsed.length; i++) {
        values.push(`(${sparesUsed[i].id}, '${model}', ${modelId}, ${sparesUsed[i].quantity}, NOW(), ${property_id})`);
    }
    sql += values.join(',') + `;`;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}

export function updateUsedSparesPositive(sparesUsed: NewSpares[], model: string, modelId: number, property_id: number) {
    let insertSql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            model,
            model_id,
            quantity,
            date_used,
            property_id
        )
    VALUES`;

    let insertVals = [];
    for (let i = 0; i < sparesUsed.length; i++) {
        if (sparesUsed[i].quantity > 0) {
            insertVals.push(`(${sparesUsed[i].id}, '${model}', ${modelId}, ${sparesUsed[i].quantity}, NOW(), ${property_id})`);
        }
    }
    insertSql += insertVals.join(',');

    if (insertVals.length > 0) {
        db.execute(insertSql);
    }
    return;
}

export function updateUsedSparesNegative(sparesUsed: NewSpares[], model: string, modelId: number, property_id: number) {
    sparesUsed.forEach(async (item) => {
        while (item.quantity > 0) {
            const data: [UsedSparesIdQuantity[], FieldPacket[]] = await db.execute(
                `SELECT id, quantity FROM spares_used WHERE spare_id = ? AND model = ? AND model_id = ? AND property_id = ? ORDER BY date_used DESC LIMIT 1;`,
                [item.id, model, modelId, property_id]
            );
            if (data[0][0].quantity > item.quantity) {
                await db.execute(`UPDATE spares_used SET quantity = quantity - ? WHERE id = ?;`, [item.quantity, data[0][0].id]);
                item.quantity = 0;
            } else {
                await db.execute(`DELETE FROM spares_used WHERE id = ?;`, [data[0][0].id]);
                item.quantity -= data[0][0].quantity;
            }
        }
    });
}

export async function updateStock(stockArray: { id: number; property_id: number; quant_remain: number }[]) {
    let errors = false;

    stockArray.forEach(async (item) => {
        const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`
            UPDATE
                spares
            SET
                quant_remain = ${item.quant_remain}
            WHERE
                id = ${item.id}
            AND
                property_id = ${item.property_id};`);
        if (response[0].affectedRows != 1) {
            errors = true;
        }
    });
    return errors;
}

export async function addSupplier(s: AddEditSupplier) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
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
            deliveries.property_id = ?
        AND
            deliveries.deleted = 0;`,
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
            deliveries.id = ?
        AND
            deleted = 0;`,
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
            AND
            spares.deleted = 0
        )
        WHERE
            delivery_items.delivery_id IN (?);`,
        [deliveryIds.join(',')]
    );
    return data[0];
}

export async function addDelivery(d: Delivery) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            deliveries
            (name, supplier, courier, placed, due, property_id, arrived)
        VALUES
            (?, ?, ?, ?, ?, ?, ?);`,
        [d.name, d.supplier, d.courier, d.placed, d.due, d.propertyId, d.arrived ? 1 : 0]
    );
    return response[0];
}

export async function addDeliveryItems(deliveryId: number, items: DeliveryItems[], costMap: {[key: number]: number}) {
    let sql = `
    INSERT INTO
        delivery_items
        (
            delivery_id,
            spare_id,
            quantity,
            value
        )
    VALUES`;

    let values = [];
    for (let i = 0; i < items.length; i++) {
        values.push(`(${deliveryId}, ${items[i].id}, ${items[i].quantity}, ${costMap[items[i].id] * items[i].quantity})`);
    }
    sql += values.join(',') + `;`;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}

export async function updateDeliveryItems(deliveryId: number, items: DeliveryItems[], costMap: {[key: number]: number}) {
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
            `DELETE FROM
                delivery_items
            WHERE
                delivery_id = ?;`,
            [deliveryId]
        );
        if (items.length > 0) {
            let sql = `INSERT INTO
                delivery_items
                (
                    delivery_id,
                    spare_id,
                    quantity,
                    value
                )
            VALUES`;

            let values = [];
            for (let i = 0; i < items.length; i++) {
                values.push(`(${deliveryId}, ${items[i].id}, ${items[i].quantity}, ${costMap[items[i].id] * items[i].quantity})`);
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

export async function getCostMapping(propertyId: number) {
    const data: [CostMapping[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            cost
        FROM
            spares
        WHERE
            property_id = ?
        AND
            deleted = 0;`,
        [propertyId]
    );
    const map: {[key: number]: number} = {}
    data[0].forEach((item) => {
        map[item.id] = item.cost 
    });
    return map
}

export async function editDelivery(d: Delivery) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
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
        [d.name, d.supplier, d.courier, d.placed, d.due, d.propertyId, d.arrived ? 1 : 0, d.id]
    );
    return response[0];
}

export async function addSpare(s: AddEditSpare) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            spares
            (part_no, man_part_no, name, man_name, description, notes, location, quant_remain, supplier, cost, property_id)
        VALUES
            (?,?,?,?,?,?,?,?,?,?,?);`,
        [s.partNo, s.manPartNo, s.name, s.manName, s.description || '', s.notes || '', s.location, s.quantRemaining, s.supplier, s.cost, s.propertyId]
    );
    return response[0];
}

export async function editSpare(s: AddEditSpare) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
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
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
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
    let response: [ResultSetHeader, FieldPacket[]];
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

export async function deleteSupplier(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE suppliers SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}

export async function deleteSparesItem(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE spares SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}

export async function deleteSparesUsed(id: number) {
    db.execute(`DELETE FROM spares_used WHERE spare_id = ?;`, [id]);
    return;
}

export async function deleteDelivery(deliveryId: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE deliveries SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [deliveryId]);
    return response[0];
}

export async function deleteDeliveryContents(deliveryId: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`DELETE FROM delivery_items WHERE delivery_id = ?;`, [deliveryId]);
    return response[0];
}

export async function deleteNote(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`DELETE FROM spares_notes WHERE id = ?;`, [id]);
    return response[0];
}
