import { Request, Response } from 'express';
import * as Properties from '../models/properties';
import * as Users from '../models/users';
import * as Assets from '../models/assets';
import * as AssetRelations from '../models/assetRelations';
import assignedUsersList from '../helpers/properties/assignedUsersList';
import propertyUsersList from '../helpers/properties/propertyUsersList';
import lastPropMapping from '../helpers/properties/lastPropMapping';
import makeIdList from '../helpers/makeIdList';

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

export async function getUsersForAssign(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const assignedUsers = await Properties.getAssignedUserIds(parseInt(propertyId));
        const assignedlist = assignedUsersList(assignedUsers)
        const allUsers = await Users.getAllUsers();
        const usersList = propertyUsersList(allUsers, assignedlist)
        res.status(200).json(usersList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLastProperty(req: Request, res: Response) {
    try {
        const userId = req.params.userid;
        const auth = await Users.getUserLevel(parseInt(userId));
        let allProps = [];
        let propIds = <number[]>[];
        if (auth == 4) {
            allProps = await Properties.getAllProperties();
        } else {
            allProps = await Properties.getAllPropertiesForUser(parseInt(userId));
        }
        propIds = makeIdList(allProps, 'id')
        const lastProp = await Properties.getLastPropertyForUser(parseInt(userId));
        if (lastProp[0] === undefined) {
            res.status(200).json(allProps);
        } else {
            if (propIds.includes(lastProp[0].property_id)) {
                const propertiesMapped = lastPropMapping(allProps, lastProp[0].property_id)
                res.status(200).json(propertiesMapped);
            } else {
                res.status(200).json(allProps);
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditProperty(req: Request, res: Response) {
    try {
        let response;
        if (req.body.id > 0) {
            response = await Properties.editProperty(req.body);
        } else {
            response = await Properties.postProperty(req.body);
            // @ts-ignore
            const asset = await Assets.insertAsset(0, response.insertId, req.body.name);
            // @ts-ignore
            const root = await AssetRelations.insertRoot(asset.insertId, response.insertId);
            // @ts-ignore
            const self = await AssetRelations.insertSelf(asset.insertId, response.insertId);
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
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function setLastProperty(req: Request, res: Response) {
    try {
        const response = await Properties.postLastProperty(req.body);
        // @ts-ignore
        if (response.affectedRows > 0) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}
