import { Request, Response } from 'express';
import * as Users from '../models/users';
import * as Facilities from '../models/facilities';
import * as Permissions from '../models/permissions';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import getConnection from '../database/database';
import { RowDataPacket } from 'mysql2';

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await Users.getAllUsers(req.clientId);
        res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAllUsersForFacility(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const users = await Facilities.getAssignedUsers(req.clientId, facilityId);
        res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getUserById(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.userid);
        const users = await Users.findById(req.clientId, userId);
        const userGroups = await Users.getAllUserGroups(req.clientId);
        res.status(200).json({ users, userGroups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAllUserGroups(req: Request, res: Response) {
    try {
        const allUserGroups = await Users.getAllUserGroups(req.clientId);
        res.status(200).json({ userGroups: allUserGroups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function login(req: Request, res: Response) {
    const client: string = req.body.client.toLowerCase();
    const name: string = req.body.username;
    const password: string = req.body.password;
    if (name.length < 1 || client.length !== 4 || password.length < 1) {
        res.status(401).json({ passedValidation: false });
    } else {
        try {
            const db = await getConnection('gmoc_master');
            const client_exists = (await db.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, ['client_' + client])) as RowDataPacket[][];
            if (client_exists[0].length === 0) {
                res.status(401).json({ passedValidation: false });
                return;
            }
            const user = await Users.findByUsername(client, name);
            const match = await bcrypt.compare(password, user[0].password);
            if (match) {
                const token = jwt.sign({ clientId: client, userId: user[0].id }, process.env.SECRET!, { expiresIn: 60 * 60 * 1000 });
                const isAdmin = user[0].user_group_id == 1; // user group 1 is always SuperAdmin
                let permissions = <{ [key: string]: { [key: string]: boolean } }>{};
                if (!isAdmin) {
                    permissions = await Permissions.getPermissionObj(client, user[0].user_group_id);
                }
                res.status(200).json({ passedValidation: true, client, user: user[0], isAdmin, permissions, token: token });
            } else {
                res.status(401).json({ passedValidation: false });
            }
        } catch (err) {
            console.log(err);
            res.status(401).json({ passedValidation: false });
        }
    }
}

export async function postUser(req: Request, res: Response) {
    let userId = req.body.id;
    try {
        let response;
        if (userId > 0) {
            response = await Users.editUser(req.clientId, req.body);
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 12);
            response = await Users.postUser(req.clientId, req.body, hashedPassword);
            userId = response.insertId;
        }
        if (req.body.user_group_id === 1) {
            const facilityIds = await Facilities.getAllFacilityIds(req.clientId);
            await Facilities.deleteAssignments(req.clientId, userId);
            await Facilities.postAdminAssignments(req.clientId, userId, facilityIds);
        }
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function addEditUserGroup(req: Request, res: Response) {
    try {
        let response;
        if (req.body.id > 0) {
            response = await Users.editUserGroup(req.clientId, req.body);
        } else {
            response = await Users.postUserGroup(req.clientId, req.body);
        }
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Users.deleteUser(req.clientId, id);
        if (deleted.affectedRows > 0) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}

export async function deleteUserGroup(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Users.deleteUserGroup(req.clientId, id);
        if (deleted.affectedRows > 0) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}
