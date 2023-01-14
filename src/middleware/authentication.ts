import { Request, Response, NextFunction } from 'express';
//import { AuthType } from '../requestTypings';
import * as jwt from 'jsonwebtoken';
import * as Users from '../models/users';

//Checks Authorrization for routes, don't think this is necessary ones check auth is implimented
export function authorised(req: Request, res: Response, next: NextFunction) {
    const token = req.get('authorisation')!.split(' ')[1];
    let decoded: any;
    try {
        decoded = jwt.verify(token, process.env.SECRET!);
        if (decoded) {
            // @ts-ignore
            req.userId = decoded.userId;
        }
    } catch (err) {
        res.status(401).json({ message: 'Authorisation failed' });
    }
    if (!decoded) {
        res.status(401).json({ message: 'Authorisation failed' });
    } else {
        next();
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
            res.status(200).json({
                user: {
                    id: user[0].id,
                    username: user[0].username,
                    first_name: user[0].first,
                    last_name: user[0].last,
                    authority: user[0].authority,
                },
            });
        } else {
            res.status(401).json({ message: 'Authorisation failed' });
        }
    } catch (err) {
        res.status(401).json({ message: 'Authorisation failed' });
    }
}
