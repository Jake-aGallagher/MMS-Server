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

interface NewSpares {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

export async function insertUsedSpares(sparesUsed: NewSpares[], jobId: number) {
    let sql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            job_id,
            num_used,
            date_used
        )
    VALUES`;

    for (let i = 0; i < sparesUsed.length; i++) {
        if (i == sparesUsed.length - 1) {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW())`;
        } else {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW()),`;
        }
    }
    sql += `;`;

    const response = await db.execute(sql);
    return response[0];
}

export async function updateUsedSpares(sparesUsed: NewSpares[], jobId: number) {
    let sql = `
    INSERT INTO
        spares_used
        (
            spare_id,
            job_id,
            num_used,
            date_used
        )
    VALUES`;

    for (let i = 0; i < sparesUsed.length; i++) {
        if (i == sparesUsed.length - 1) {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW())`;
        } else {
            sql += `(${sparesUsed[i].id}, ${jobId}, ${sparesUsed[i].num_used}, NOW()),`;
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
