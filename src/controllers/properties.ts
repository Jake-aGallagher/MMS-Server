import { Request, Response } from 'express';
import * as Properties from '../models/properties';
import * as Users from '../models/users';

export async function getAllProperties(req: Request, res: Response) {
    try {
        const allProperties = await Properties.getAllProperties();
        res.status(200).json(allProperties);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getPropertyDetails(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const propDetails = await Properties.getPropertyDetails(parseInt(propertyId));
        res.status(200).json(propDetails);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAssignedUsers(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const assignedUsers = await Properties.getAssignedUsers(parseInt(propertyId));
        res.status(200).json(assignedUsers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

interface UsersList {
    id: number;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    authority: number;
    assigned: boolean;
}

export async function getUsersForAssign(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const assignedlist = <number[]>[];
        const usersList = <UsersList[]>[];

        const assignedUsers = await Properties.getAssignedUserIds(parseInt(propertyId));
        assignedUsers.forEach((user) => {
            assignedlist.push(user.id);
        });

        const allUsers = await Users.getAllUsers();
        allUsers.forEach((user) => {
            if (assignedlist.includes(user.id) && user.authority != 4) {
                usersList.push({ ...user, assigned: true });
            } else if (user.authority != 4) {
                usersList.push({ ...user, assigned: false });
            }
        });
        res.status(200).json(usersList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postProperty(req: Request, res: Response) {
    try {
        const response = await Properties.postProperty(req.body);
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

export async function editProperty(req: Request, res: Response) {
    try {
        const response = await Properties.editProperty(req.body);
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

export async function setAssignedUsers(req: Request, res: Response) {
    try {
        const response = await Properties.setAssignedUsers(req.body.propertyNo, req.body.assignedUsers);
        // @ts-ignore
        if (response.affectedRows > 0) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ created: false });
    }
}