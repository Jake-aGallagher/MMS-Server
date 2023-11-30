import { Request, Response, NextFunction } from 'express';
//import { AuthType } from '../types/requestTypings';
import * as jwt from 'jsonwebtoken';
import * as Users from '../models/users';
import * as Permissions from '../models/permissions';

//Checks Authorisation for routing
export function authorised(req: Request, res: Response, next: NextFunction) {
    const token = req.get('authorisation')!.split(' ')[1];
    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.SECRET!);
        if (decoded) {
            // @ts-ignore
            req.userId = decoded.userId;
            next();
        } else {
            res.status(401).json({ message: 'Authorisation failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Authorisation failed' });
    }
}

//Checks authentication when page is refreshed
export async function checkAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.get('authorisation')!.split(' ')[1];
    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.SECRET!);
        if (decoded) {
            // @ts-ignore
            req.userId = decoded.userId;
            // @ts-ignore
            const user = await Users.findById(req.userId);
            let permissions = <{ [key: string]: { [key: string]: boolean } }>{};
                if (user[0].user_group_id != 1) {
                    permissions = await Permissions.getPermissionObj(user[0].user_group_id);
                }
            res.status(200).json({
                user: {
                    id: user[0].id,
                    username: user[0].username,
                    first_name: user[0].first,
                    last_name: user[0].last,
                    user_group_id: user[0].user_group_id,
                    isAdmin: user[0].user_group_id == 1,
                },
                permissions
            });
        } else {
            res.status(401).json({ message: 'Authorisation failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Authorisation failed' });
    }
}
