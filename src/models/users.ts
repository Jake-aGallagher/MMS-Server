import db from '../database/database';
import { FieldPacket, RowDataPacket } from 'mysql2/typings/mysql';

interface User extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    authority: number;
}

export async function getAllUsers() {
    const data = await db.execute<User[]>(
        `SELECT
             id,
             username,
             first_name,
             last_name,
             authority
        FROM
            users;`
    );
    return data[0];
}

export async function findByUsername(username: string) {
    const data: [User[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             username,
             password,
             first_name AS first,
             last_name AS last,
             authority
        FROM
            users
        WHERE
            username = ?;`,
        [username]
    );
    return data[0];
}

export async function findById(id: number) {
    const data: [User[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             username,
             password,
             first_name AS first,
             last_name AS last,
             authority
        FROM
            users
        WHERE
            id = ?;`,
        [id]
    );
    return data[0];
}

export async function postUser(body: { username: string; first: string; last: string }, hashedPassword: string, authLevel: number) {
    const username = body.username;
    const first = body.first;
    const last = body.last;
    const password = hashedPassword;
    const auth = authLevel;

    const response = await db.execute(
        `INSERT INTO
          users
          (
              username,
              first_name,
              last_name,
              password,
              authority
          )
      VALUES
          (?,?,?,?,?);`,
        [username, first, last, password, auth]
    );
    return response[0];
}
