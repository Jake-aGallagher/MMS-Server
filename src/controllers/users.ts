import { Request, Response } from 'express';
import * as Users from '../models/users';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export async function getAllUsers(req: Request, res: Response) {
    const allUsers = await Users.getAllUsers();
    res.status(200).json(allUsers);
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
                res.status(200).json({ response: { passedValidation: true, user: user[0], token: token} });
            } else {
                res.status(401).json({ response: { passedValidation: false } });
            }
        } catch (err) {
            res.status(401).json({ response: { passedValidation: false } });
        }
    }
}
