import db from '../database/database';

export async function getAllProperties() {
    const response = await db.execute(
        `SELECT
             id,
             name,
             type,
             address,
             city,
             county,
             postcode
        FROM
            properties
        ORDER BY
            name;`
    );
    return response[0];
}