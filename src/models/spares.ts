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