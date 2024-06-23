import getConnection from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { Downtime } from '../../types/maintenance/jobs';

export async function getDowntimeDetails(client: string, model: string, modelId: number) {
    const db = await getConnection('client_' + client);
    const data: [Downtime[], FieldPacket[]] = await db.execute(
        `SELECT
            downtime.asset AS id,
            downtime.time,
            assets.name
        FROM
            downtime
        INNER JOIN assets ON
        (
            downtime.asset = assets.id
        )
        WHERE
            downtime.model = ?
            AND
            downtime.model_id = ?;`,
        [model, modelId]
    );
    return data[0];
}

export async function setDowntimeDetails(client: string, details: [{ id: number; time: number }], model: string, modelId: number, facilityId: number) {
    const db = await getConnection('client_' + client);
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
            `DELETE FROM
                downtime
            WHERE
                model = ?
                AND
                model_id = ?;`,
            [model, modelId]
        );
        if (details.length > 0) {
            let sql = `INSERT INTO
                downtime
                (
                    asset,
                    model,
                    model_id,
                    time,
                    date,
                    facility_id
                )
            VALUES`;

            let values = [];
            for (let i = 0; i < details.length; i++) {
                if (details[i].time > 0) {
                    values.push(`(${details[i].id}, '${model}', ${modelId}, ${details[i].time}, NOW(), ${facilityId})`);
                }
            }
            if (values.length > 0) {
                sql += values.join(',') + `;`;
                await conn.execute(sql);
            }
        }
        await conn.commit();
        conn.release();
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
}
