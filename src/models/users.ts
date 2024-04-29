import db from '../database/database';
import { FieldPacket, ResultSetHeader } from 'mysql2/typings/mysql';
import { UserGroupOnly, UserLongName, UserShortName, UserPassword } from '../types/users';

export async function getAllUsers() {
    const data: [UserLongName[], FieldPacket[]] = await db.execute(
        `SELECT
            users.id,
            users.username,
            users.first_name,
            users.last_name,
            users.user_group_id,
            user_groups.name AS user_group_name
        FROM
            users
        INNER JOIN user_groups ON
        (
            users.user_group_id = user_groups.id
        )
        WHERE
            users.deleted = 0;`
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
             user_group_id
        FROM
            users
        WHERE
            username = ?
        AND
            deleted = 0;`,
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
             user_group_id
        FROM
            users
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [id]
    );
    return data[0];
}

export async function getUsersByIds(userIds: number[]) {
    const sql = db.format(
        `SELECT
             id,
             username,
             first_name AS first,
             last_name AS last,
             user_group_id
        FROM
            users
        WHERE
            id IN (?)
        AND
            deleted = 0;`,
        [userIds]
    );
    const data: [UserShortName[], FieldPacket[]] = await db.execute(sql);
    return data[0];
}

export async function getAllUserGroups() {
    const data: [UserLongName[], FieldPacket[]] = await db.execute(
        `SELECT
             id,
             name
        FROM
            user_groups
        WHERE
            name != 'SuperAdmin'
        AND
            deleted = 0;`
    );
    return data[0];
}

export async function postUser(body: { username: string; first: string; last: string; user_group_id: number }, hashedPassword: string) {
    const username = body.username;
    const first = body.first;
    const last = body.last;
    const password = hashedPassword;
    const user_group_id = body.user_group_id;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
          users
          (
              username,
              first_name,
              last_name,
              password,
              user_group_id
          )
      VALUES
          (?,?,?,?,?);`,
        [username, first, last, password, user_group_id]
    );
    return response[0];
}

export async function editUser(body: { id: string; username: string; first: string; last: string; user_group_id: number }) {
    const id = parseInt(body.id);
    const username = body.username;
    const first = body.first;
    const last = body.last;
    const user_group_id = body.user_group_id;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            users
        SET
            username = ?,
            first_name = ?,
            last_name = ?,
            user_group_id = ?
        WHERE
            id = ?;`,
        [username, first, last, user_group_id, id]
    );
    return response[0];
}

export async function postUserGroup(body: { name: string }) {
    const name = body.name;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `INSERT INTO
          user_groups
          (
              name
          )
      VALUES
          (?);`,
        [name]
    );
    return response[0];
}

export async function editUserGroup(body: { id: string; name: string }) {
    const id = parseInt(body.id);
    const name = body.name;

    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(
        `UPDATE
            facilities
        SET
            name = ?
        WHERE
            id = ?;`,
        [name, id]
    );
    return response[0];
}

export async function getUserLevel(userId: number) {
    const response: [UserGroupOnly[], FieldPacket[]] = await db.execute(
        `SELECT
            user_group_id
        FROM
            users
        WHERE
            id = ?
        AND
            deleted = 0;`,
        [userId]
    );
    return response[0][0].user_group_id;
}

export async function deleteUser(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE users SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}

export async function deleteUserGroup(id: number) {
    const response: [ResultSetHeader, FieldPacket[]] = await db.execute(`UPDATE user_groups SET deleted = 1, deleted_date = NOW() WHERE id = ?;`, [id]);
    return response[0];
}
