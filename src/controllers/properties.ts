import { Request, Response } from 'express';
import * as Properties from '../models/properties';
import * as Users from '../models/users';
import * as Assets from '../models/assets';
import * as AssetRelations from '../models/assetRelations';
import * as Jobs from '../models/jobs';
import * as DefaultGraphs from '../helpers/graphs/defaultGraphs';
import assignedUsersList from '../helpers/assignedIdsList';
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
        const propertyId = parseInt(req.params.propertyid);
        const propDetails = await Properties.getPropertyDetails(propertyId);
        const assignedUsers = await Properties.getAssignedUsers(propertyId);
        const assetId = await Assets.getAssetRoot(propertyId);
        const getChildren = await AssetRelations.getChildren(assetId[0].id);
        const idsForRecents = makeIdList(getChildren, 'descendant_id');
        const recentJobs = await Jobs.getRecentJobs(idsForRecents);
        // Todo - batch all these default graph calls together
        const incompleteJobs = await DefaultGraphs.getIncompleteJobs(propertyId);
        const raised6M = await DefaultGraphs.getJobsRaised6M(propertyId);
        const sparesUsed6M = await DefaultGraphs.getSparesUsed6M(propertyId);
        const mostUsed6M = await DefaultGraphs.mostUsedSpares6M(propertyId);
        const sparesCost6M = await DefaultGraphs.sparesCost6M(propertyId);
        res.status(200).json({ propDetails, assignedUsers, recentJobs, incompleteJobs, raised6M, sparesUsed6M, mostUsed6M, sparesCost6M });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getUsersForAssign(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const assignedUsers = await Properties.getAssignedUserIds(parseInt(propertyId));
        const assignedlist = assignedUsersList(assignedUsers);
        const allUsers = await Users.getAllUsers();
        const usersList = propertyUsersList(allUsers, assignedlist);
        res.status(200).json(usersList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLastProperty(req: Request, res: Response) {
    try {
        const userId = req.params.userid;
        const user_group_id = await Users.getUserLevel(parseInt(userId));
        let allProps = [];
        let propIds = <number[]>[];
        if (user_group_id == 1) {
            allProps = await Properties.getAllProperties();
        } else {
            allProps = await Properties.getAllPropertiesForUser(parseInt(userId));
        }
        propIds = makeIdList(allProps, 'id');
        const lastProp = await Properties.getLastPropertyForUser(parseInt(userId));
        if (lastProp[0] === undefined) {
            res.status(200).json(allProps);
        } else {
            if (propIds.includes(lastProp[0].property_id)) {
                const propertiesMapped = lastPropMapping(allProps, lastProp[0].property_id);
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
            Assets.renameRootAsset(req.body.name, req.body.id);
        } else {
            response = await Properties.postProperty(req.body);
            const asset = await Assets.insertAsset(0, response.insertId, req.body.name, '');
            await AssetRelations.insertRoot(asset.insertId, response.insertId);
            await AssetRelations.insertSelf(asset.insertId, response.insertId);
        }
        const propertyId = req.body.id ? req.body.id : response.insertId;
        // @ts-ignore
        Properties.postLastProperty({ userId: req.userId, propertyId: propertyId });
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true, newPropId: propertyId });
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
        if (response) {
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
        if (response && response.affectedRows > 0) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}
