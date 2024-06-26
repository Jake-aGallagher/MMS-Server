import getConnection from '../../database/database';
import { FieldPacket } from 'mysql2/typings/mysql';
import { TimeDetails } from '../../types/maintenance/jobs';

export async function getLoggedTimeDetails(client: string, model: string, modelId: number) {
    const db = await getConnection('client_' + client);
    const data: [TimeDetails[], FieldPacket[]] = await db.execute(
        `SELECT
            logged_time.user_id AS id,
            logged_time.time,
            concat(users.first_name, ' ', users.last_name) as 'name'
        FROM
            logged_time
        INNER JOIN users ON
        (
            logged_time.user_id = users.id
        )
        WHERE
            logged_time.model = ?
            AND
            logged_time.model_id = ?;`,
        [model, modelId]
    );
    return data[0];
}

export async function setTimeDetails(client: string, details: [{ id: number; time: number }], model: string, modelId: number) {
    const db = await getConnection('client_' + client);
    try {
        const conn = await db.getConnection();
        await conn.beginTransaction();
        await conn.execute(
            `DELETE FROM
                logged_time
            WHERE
                model = ?
                AND
                model_id = ?;`,
            [model, modelId]
        );
        if (details.length > 0) {
            let sql = `INSERT INTO
                logged_time
                (
                    user_id,
                    model,
                    model_id,
                    time
                )
            VALUES`;

            let values = [];
            for (let i = 0; i < details.length; i++) {
                values.push(`(${details[i].id}, '${model}', ${modelId}, ${details[i].time})`);
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
