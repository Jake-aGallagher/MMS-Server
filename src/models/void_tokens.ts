import db from '../database/database';
import { FieldPacket, RowDataPacket } from 'mysql2';

interface VoidToken extends RowDataPacket {
    token_id: string;
}

export async function checkVoidToken(token: string) {
    const data: [VoidToken[], FieldPacket[]] = await db.execute(
        `SELECT
            token_id
        FROM
            void_tokens
        WHERE
            token_id = ?;`,
        [token]
    );
    return data[0].length > 0;
}

export async function addVoidToken(token: string) {
    await db.execute(
        `INSERT INTO void_tokens (token_id) VALUES (?);`,
        [token]
    );
}
