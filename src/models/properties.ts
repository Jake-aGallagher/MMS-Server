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

export async function getPropertyDetails(propertyId: number) {
    const data = await db.execute(
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
        WHERE
            id = ?;`,
        [propertyId]
    );
    return data[0];
}

export async function postProperty(body: { name: string; type: string; address: string, city: string, county: string, postcode: string }) {
    const name = body.name;
    const type = body.type;
    const address = body.address;
    const city = body.address;
    const county = body.county;
    const postcode = body.postcode;

    const response = await db.execute(
        `INSERT INTO
          properties
          (
              name,
              type,
              address,
              city,
              county,
              postcode
          )
      VALUES
          (?,?,?,?,?,?);`,
        [name, type, address, city, county, postcode]
    );
    return response[0];
}

export async function editProperty(body: {id: string, name: string; type: string; address: string, city: string, county: string, postcode: string}) {
    const id = parseInt(body.id);
    const name = body.name;
    const type = body.type;
    const address = body.address;
    const city = body.city;
    const county = body.county;
    const postcode = body.postcode;

    const response = await db.execute(
        `UPDATE
            properties
        SET
            name = ?,
            type = ?,
            address = ?,
            city = ?,
            county = ?,
            postcode = ?
        WHERE
            id = ?;`,
        [name, type, address, city, county, postcode, id]
    );
    return response[0];
}