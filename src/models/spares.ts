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

export async function getUsedSpares(jobId: number) {
    const data = await db.execute(
        `SELECT 
            spares.id,
            spares_used.spare_id AS part_no,
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