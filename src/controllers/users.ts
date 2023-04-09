import { Request, Response } from 'express';
import * as Users from '../models/users';
import * as Properties from '../models/properties';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import authSwitchCase from '../helpers/users/authSwitchCase';

export async function getAllUsers(req: Request, res: Response) {
    try {
        const allUsers = await Users.getAllUsers();
        res.status(200).json(allUsers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function login(req: Request, res: Response) {
    const name: string = req.body.username;
    const password: string = req.body.password;
    if (name.length < 1) {
        res.status(401).json({ response: { passedValidation: false } });
    } else {
        try {
            const user = await Users.findByUsername(name);
            const match = await bcrypt.compare(password, user[0].password);
            if (match) {
                const token = jwt.sign({ userId: user[0].id }, process.env.SECRET!, { expiresIn: '1h' });
                res.status(200).json({ response: { passedValidation: true, user: user[0], token: token } });
            } else {
                res.status(401).json({ response: { passedValidation: false } });
            }
        } catch (err) {
            console.log(err);
            res.status(401).json({ response: { passedValidation: false } });
        }
    }
}

export async function postUser(req: Request, res: Response) {
    let authLevel = authSwitchCase(req.body.auth)
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        const response = await Users.postUser(req.body, hashedPassword, authLevel);
        if (authLevel === 4) {
            const propertyIds = await Properties.getAllPropertyIds()
            // @ts-ignore
            const AdminPropAssign = Properties.postAdminAssignments(response.insertId, propertyIds)
        }
        // @ts-ignore
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
