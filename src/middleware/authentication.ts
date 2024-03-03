import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as Users from '../models/users';
import * as Permissions from '../models/permissions';
import { JwtPayload } from '../types/requestTypings';
import { addVoidToken, checkVoidToken } from '../models/void_tokens';

//Checks Authorisation for routing
export function authorised(req: Request, res: Response, next: NextFunction) {
    const token = req.get('authorisation')!.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET!) as JwtPayload;
        if (decoded) {
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
export async function checkAuth(req: Request, res: Response) {
    const oldToken = req.get('authorisation')!.split(' ')[1];
    try {
        const voidToken = await checkVoidToken(oldToken);
        if (voidToken) {
            res.status(401).json({ message: 'Authorisation failed' });
            return;
        }
        const decoded = jwt.verify(oldToken, process.env.SECRET!) as JwtPayload;
        if (decoded) {
            const user = await Users.findById(decoded.userId);
            const token = jwt.sign({ userId: user[0].id }, process.env.SECRET!, { expiresIn: 60 * 60 });
            await addVoidToken(oldToken)
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
                permissions,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Authorisation failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Authorisation failed' });
    }
}
