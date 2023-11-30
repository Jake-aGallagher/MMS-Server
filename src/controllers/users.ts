import { Request, Response } from 'express';
import * as Users from '../models/users';
import * as Properties from '../models/properties';
import * as Permissions from '../models/permissions';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export async function getAllUsers(req: Request, res: Response) {
    try {
        const allUsers = await Users.getAllUsers();
        res.status(200).json(allUsers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAllUsersForProperty(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const users = await Properties.getAssignedUsers(propertyId);
        res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getUserById(req: Request, res: Response) {
    try {
        const userId = parseInt(req.params.userid);
        const users = await Users.findById(userId);
        const userGroups = await Users.getAllUserGroups();
        res.status(200).json({ users, userGroups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAllUserGroups(req: Request, res: Response) {
    try {
        const allUserGroups = await Users.getAllUserGroups();
        res.status(200).json({ userGroups: allUserGroups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function login(req: Request, res: Response) {
    const name: string = req.body.username;
    const password: string = req.body.password;
    if (name.length < 1) {
        res.status(401).json({ passedValidation: false });
    } else {
        try {
            const user = await Users.findByUsername(name);
            const match = await bcrypt.compare(password, user[0].password);
            if (match) {
                const token = jwt.sign({ userId: user[0].id }, process.env.SECRET!, { expiresIn: '1h' });
                const isAdmin = user[0].user_group_id == 1; // user group 1 is always SuperAdmin
                let permissions = <{ [key: string]: { [key: string]: boolean } }>{};
                if (!isAdmin) {
                    permissions = await Permissions.getPermissionObj(user[0].user_group_id);
                }
                res.status(200).json({ passedValidation: true, user: user[0], isAdmin, permissions, token: token });
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
            response = await Users.editUser(req.body);
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 12);
            response = await Users.postUser(req.body, hashedPassword);
            userId = response.insertId;
        }
        if (req.body.user_group_id === 1) {
            const propertyIds = await Properties.getAllPropertyIds();
            await Properties.deleteAssignments(userId);
            await Properties.postAdminAssignments(userId, propertyIds);
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
            response = await Users.editUserGroup(req.body);
        } else {
            response = await Users.postUserGroup(req.body);
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
