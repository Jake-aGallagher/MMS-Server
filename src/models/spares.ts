import getConnection from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import {
    CurrentStock,
    UsedSpares,
    recentlyUsed,
    ExtendedStock,
    NewSpares,
    Delivery,
    DeliveryItem,
    DeliveryItems,
    AddEditSpare,
    SparesDetails,
    jobsOfRecentlyUsed,
    UsedSparesIdQuantity,
    CostMapping,
} from '../types/spares';

export async function getAllSpares(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
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
            facility_id = ?
        AND
            deleted = 0;`,
        [facilityId]
    );
    return data[0];
}

export async function getAllSparesBasic(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT 
            id,
            part_no,
            name
        FROM 
            spares
        WHERE
            facility_id = ?
        AND
            deleted = 0
        ORDER BY
            part_no
        DESC;`,
        [facilityId]
    );
    return data[0];
}

export async function getSpares(client: string, id: number) {
    const db = await getConnection('client_' + client);
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

export async function getCurrentSpecificStock(client: string, stockChangeIds: number[], facilityId: number) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
        `SELECT
            id,
            quant_remain
        FROM
            spares
        WHERE
            id IN (?)
        AND
            facility_id = ?
        AND
            deleted = 0;`,
        [stockChangeIds, facilityId]
    );
    const data: [CurrentStock[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function getUsedSpares(client: string, model: string, modelId: number, type: 'used' | 'missing') {
    const db = await getConnection('client_' + client);
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
            spares_used.model = ?
        AND
            spares_used.model_id = ?
        AND
            spares_used.record_type = ?
        GROUP BY
            spares_used.spare_id;`,
        [model, modelId, type]
    );
    return data[0];
}

export async function getUsedRecently(client: string, facilityId: number, monthsOfData: number) {
    const db = await getConnection('client_' + client);
    const data: [recentlyUsed[], FieldPacket[]] = await db.execute(
        `SELECT
            spare_id,
            SUM(quantity) AS total_used
        FROM
            spares_used
        WHERE
            facility_id = ?
        AND
            record_type = 'used'
        AND
            date_used > DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY
            spare_id`,
        [facilityId, monthsOfData]
    );
    return data[0];
}

export async function getRecentTasksForSpare(client: string, facilityId: number, spareId: number, model: string) {
    const db = await getConnection('client_' + client);
    const data: [jobsOfRecentlyUsed[], FieldPacket[]] = await db.execute(
        `SELECT
            model_id
        FROM
            spares_used
        WHERE
            facility_id = ?
        AND
            spare_id = ?
        AND
            model = ?
        AND
            record_type = 'used'
        ORDER BY 
            date_used DESC    
        LIMIT
            5`,
        [facilityId, spareId, model]
    );
    return data[0];
}

export async function getSparesRemaining(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
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
            facility_id = ?
        AND
            deleted = 0;`,
        [facilityId]
    );
    return data[0];
}

export async function getSparesRemainingToBeDelivered(client: string, deliveryId: number) {
    const db = await getConnection('client_' + client);
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

export async function getDeliveryInfoOfSpare(client: string, spareId: number, facilityId: number) {
    const db = await getConnection('client_' + client);
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
            deliveries.facility_id = ?
        AND
            deliveries.arrived = 0
        ORDER BY
            deliveries.due
        LIMIT 1;`,
        [spareId, facilityId]
    );
    return data[0];
}

export async function getSparesNotes(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data = await db.execute(
        `SELECT
            id,
            title,
            content,
            DATE_FORMAT(created, "%d/%m/%y") AS 'created_date'
        FROM
            spares_notes
        WHERE
            facility_id = ?
        ORDER BY
            created
        DESC;`,
        [facilityId]
    );
    return data[0];
}

export async function getSpareStock(client: string, spareId: number) {
    const db = await getConnection('client_' + client);
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

export async function getNote(client: string, noteId: number) {
    const db = await getConnection('client_' + client);
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

export async function insertUsedSpares(client: string, sparesUsed: NewSpares[], model: string, modelId: number, facility_id: number, type: 'used' | 'missing') {
    const db = await getConnection('client_' + client);
    let sql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            record_type,
            model,
            model_id,
            quantity,
            date_used,
            facility_id
        )
    VALUES`;

    let values = [];
    for (let i = 0; i < sparesUsed.length; i++) {
        values.push(`(${sparesUsed[i].id}, '${type}', '${model}', ${modelId}, ${sparesUsed[i].quantity}, NOW(), ${facility_id})`);
    }
    sql += values.join(',') + `;`;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
    return response[0];
}

export async function updateUsedSparesPositive(client: string, sparesUsed: NewSpares[], model: string, modelId: number, facility_id: number, type: 'used' | 'missing') {
    const db = await getConnection('client_' + client);
    let insertSql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            record_type,
            model,
            model_id,
            quantity,
            date_used,
            facility_id
        )
    VALUES`;

    let insertVals = [];
    for (let i = 0; i < sparesUsed.length; i++) {
        if (sparesUsed[i].quantity > 0) {
            insertVals.push(`(${sparesUsed[i].id}, '${type}', '${model}', ${modelId}, ${sparesUsed[i].quantity}, NOW(), ${facility_id})`);
        }
    }
    insertSql += insertVals.join(',');

    if (insertVals.length > 0) {
        db.execute(insertSql);
    }
    return;
}

export async function updateUsedSparesNegative(client: string, sparesUsed: NewSpares[], model: string, modelId: number, facility_id: number, type: 'used' | 'missing') {
    const db = await getConnection('client_' + client);
    sparesUsed.forEach(async (item) => {
        while (item.quantity > 0) {
            const data: [UsedSparesIdQuantity[], FieldPacket[]] = await db.execute(
                `SELECT id, quantity FROM spares_used WHERE spare_id = ? AND model = ? AND model_id = ? AND facility_id = ? AND record_type = ? ORDER BY date_used DESC LIMIT 1;`,
                [item.id, model, modelId, facility_id, type]
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

export async function updateStock(client: string, stockArray: { id: number; facility_id: number; quant_remain: number }[]) {
    const db = await getConnection('client_' + client);
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
                facility_id = ${item.facility_id};`);
        if (response[0].affectedRows != 1) {
            errors = true;
        }
    });
    return errors;
}

export async function getDeliveries(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data: [Delivery[], FieldPacket[]] = await db.execute(
        `SELECT
            deliveries.id,
            deliveries.name,
            IF(suppliers.name, suppliers.name, 'None') AS supplier,
            deliveries.courier,
            DATE_FORMAT(deliveries.placed, "%d/%m/%y") AS placed,
            DATE_FORMAT(deliveries.due, "%d/%m/%y") AS due,
            deliveries.arrived
        FROM
            deliveries
        LEFT JOIN suppliers ON
        (
            suppliers.id = deliveries.supplier
        )
        WHERE
            deliveries.facility_id = ?
        AND
            deliveries.deleted = 0;`,
        [facilityId]
    );
    return data[0];
}

export async function getDeliveryById(client: string, deliveryId: number) {
    const db = await getConnection('client_' + client);
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

export async function getDeliveryItems(client: string, deliveryIds: number[]) {
    const db = await getConnection('client_' + client);
    const sql = db.format(
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
        [deliveryIds]
    );
    const data: [DeliveryItem[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function addDelivery(client: string, d: Delivery) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            deliveries
            (name, supplier, courier, placed, due, facility_id, arrived)
        VALUES
            (?, ?, ?, ?, ?, ?, ?);`,
        [d.name, d.supplier, d.courier, d.placed, d.due, d.facilityId, d.arrived ? 1 : 0]
    );
    return response[0];
}

export async function addDeliveryItems(client: string, deliveryId: number, items: DeliveryItems[], costMap: { [key: number]: number }) {
    const db = await getConnection('client_' + client);
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

export async function updateDeliveryItems(client: string, deliveryId: number, items: DeliveryItems[], costMap: { [key: number]: number }) {
    const db = await getConnection('client_' + client);
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

export async function getCostMapping(client: string, facilityId: number) {
    const db = await getConnection('client_' + client);
    const data: [CostMapping[], FieldPacket[]] = await db.execute(
        `SELECT
            id,
            cost
        FROM
            spares
        WHERE
            facility_id = ?
        AND
            deleted = 0;`,
        [facilityId]
    );
    const map: { [key: number]: number } = {};
    data[0].forEach((item) => {
        map[item.id] = item.cost;
    });
    return map;
}

export async function editDelivery(client: string, d: Delivery) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            deliveries
        SET
            name = ?,
            supplier = ?,
            courier = ?,
            placed = ?,
            due = ?,
            facility_id = ?,
            arrived = ?
        WHERE
            id = ?;`,
        [d.name, d.supplier, d.courier, d.placed, d.due, d.facilityId, d.arrived ? 1 : 0, d.id]
    );
    return response[0];
}

export async function addSpare(client: string, s: AddEditSpare) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
            spares
            (part_no, man_part_no, name, man_name, description, notes, location, quant_remain, supplier, cost, facility_id)
        VALUES
            (?,?,?,?,?,?,?,?,?,?,?);`,
        [s.partNo, s.manPartNo, s.name, s.manName, s.description || '', s.notes || '', s.location, s.quantRemaining, s.supplier, s.cost, s.facilityId]
    );
    return response[0];
}

export async function editSpare(client: string, s: AddEditSpare) {
    const db = await getConnection('client_' + client);
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
            facility_id = ?
        WHERE
            id = ?;`,
        [s.partNo, s.manPartNo, s.name, s.manName, s.description, s.notes, s.location, s.quantRemaining, s.supplier, s.cost, s.facilityId, s.id]
    );
    return response[0];
}

export async function adjustSpareStock(client: string, id: number, newStockLevel: number) {
    const db = await getConnection('client_' + client);
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

export async function postSparesNote(client: string, body: { facilityId: string; title: string; note: string; noteId: number }) {
    const db = await getConnection('client_' + client);
    let response: [ResultSetHeader, FieldPacket[]];
    if (body.noteId === 0) {
        response = await db.execute(
            `INSERT INTO
                spares_notes
                (
                    facility_id,
                    title,
                    content,
                    created
                )
            VALUES
                (?,?,?,NOW());`,
            [body.facilityId, body.title, body.note]
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

export async function deleteSparesItem(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE spares SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}

export async function deleteSparesUsed(client: string, id: number) {
    const db = await getConnection('client_' + client);
    db.execute(`DELETE FROM spares_used WHERE spare_id = ?;`, [id]);
    return;
}

export async function deleteDelivery(client: string, deliveryId: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE deliveries SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [deliveryId]);
    return response[0];
}

export async function deleteDeliveryContents(client: string, deliveryId: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`DELETE FROM delivery_items WHERE delivery_id = ?;`, [deliveryId]);
    return response[0];
}

export async function deleteNote(client: string, id: number) {
    const db = await getConnection('client_' + client);
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`DELETE FROM spares_notes WHERE id = ?;`, [id]);
    return response[0];
}
