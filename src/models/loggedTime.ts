import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import { TimeDetails } from '../types/jobs';

export async function getLoggedTimeDetails(model: string, modelId: number) {
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

export async function setTimeDetails(details: [{ id: number; time: number }], model: string, modelId: number) {
    const res: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `DELETE FROM
            logged_time
        WHERE
            model = ?
            AND
            model_id = ?;`,
        [model, modelId]
    );
    if (res) {
        let sql = `
            INSERT INTO
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

        const response: [ResultSetHeader, FieldPacket[]] = await db.execute(sql);
        return response[0];
    }
}