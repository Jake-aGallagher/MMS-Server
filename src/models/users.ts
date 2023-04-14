import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import { AuthOnly, UserLongName, UserShortName, UserPassword } from '../types/users';

export async function getAllUsers() {
    const data: [UserLongName[], FieldPacket[]] = await db.execute(
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
    const data: [UserPassword[], FieldPacket[]] = await db.execute(
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
    const data: [UserShortName[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             username,
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

export async function getUsersByIds(userIds: number[]) {
    const data: [UserShortName[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             username,
             first_name AS first,
             last_name AS last,
             authority
        FROM
            users
        WHERE
            id IN (${userIds});`
    );
    return data[0];
}

export async function postUser(body: { username: string; first: string; last: string }, hashedPassword: string, authLevel: number) {
    const username = body.username;
    const first = body.first;
    const last = body.last;
    const password = hashedPassword;
    const auth = authLevel;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
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

export async function getUserLevel(userId: number) {
    const response: [AuthOnly[], FieldPacket[]]  = await db.execute(
        `SELECT
            authority
        FROM
            users
        WHERE
            id = ?;`,
        [userId]
    );
    return response[0][0].authority;
}
