import { Request, Response } from 'express';
import * as Facilities from '../models/facilities';
import * as Users from '../models/users';
import * as Assets from '../models/assets';
import * as AssetRelations from '../models/assetRelations';
import * as Jobs from '../models/jobs';
import * as DefaultGraphs from '../helpers/graphs/defaultGraphs';
import assignedUsersList from '../helpers/assignedIdsList';
import facilityUsersList from '../helpers/facilities/facilityUsersList';
import lastFacilityMapping from '../helpers/facilities/lastFacilityMapping';
import makeIdList from '../helpers/makeIdList';
import { getCustomFieldData, updateFieldData } from '../models/customFields';
import { RecentJobs } from '../types/jobs';

export async function getFacilitiesForUser(req: Request, res: Response) {
    try {
        if (req.userId) {
            const user_group_id = await Users.getUserLevel(req.clientId, req.userId);
            let allFacilities = [];
            if (user_group_id == 1) {
                allFacilities = await Facilities.getAllFacilities(req.clientId);
            } else {
                allFacilities = await Facilities.getAllFacilitiesForUser(req.clientId, req.userId);
            }
            res.status(200).json({ allFacilities });
        } else {
            res.status(500).json({ message: 'Request failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAllFacilities(req: Request, res: Response) {
    try {
        const allFacilities = await Facilities.getAllFacilities(req.clientId);
        res.status(200).json(allFacilities);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getFacilityDetails(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const facilityDetails = await Facilities.getFacilityDetails(req.clientId, facilityId);
        const assignedUsers = await Facilities.getAssignedUsers(req.clientId, facilityId);
        const assetId = await Assets.getAssetRoot(req.clientId, facilityId);
        const getChildren = await AssetRelations.getChildren(req.clientId, assetId[0].id);
        const idsForRecents = makeIdList(getChildren, 'descendant_id');
        let recentJobs: RecentJobs[] = [];
        if (idsForRecents.length > 0) {
            recentJobs = await Jobs.getRecentJobs(req.clientId, idsForRecents);
        }
        // Todo - batch all these default graph calls together
        const incompleteJobs = await DefaultGraphs.getIncompleteJobs(req.clientId, facilityId);
        const raised6M = await DefaultGraphs.getJobsRaised6M(req.clientId, facilityId);
        const sparesUsed6M = await DefaultGraphs.getSparesUsed6M(req.clientId, facilityId);
        const mostUsed6M = await DefaultGraphs.mostUsedSpares6M(req.clientId, facilityId);
        const sparesCost6M = await DefaultGraphs.sparesCost6M(req.clientId, facilityId);
        // Extra field stuff
        const customFields = await getCustomFieldData(req.clientId, 'facility', facilityId);
        res.status(200).json({ facilityDetails, customFields, assignedUsers, recentJobs, incompleteJobs, raised6M, sparesUsed6M, mostUsed6M, sparesCost6M });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getUsersForAssign(req: Request, res: Response) {
    try {
        const facilityId = req.params.facilityid;
        const assignedUsers = await Facilities.getAssignedUserIds(req.clientId, parseInt(facilityId));
        const assignedlist = assignedUsersList(assignedUsers);
        const allUsers = await Users.getAllUsers(req.clientId);
        const usersList = facilityUsersList(allUsers, assignedlist);
        res.status(200).json(usersList);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getLastFacility(req: Request, res: Response) {
    try {
        const userId = req.params.userid;
        const user_group_id = await Users.getUserLevel(req.clientId, parseInt(userId));
        let allFacilities = [];
        let facilityIds = <number[]>[];
        if (user_group_id == 1) {
            allFacilities = await Facilities.getAllFacilities(req.clientId);
        } else {
            allFacilities = await Facilities.getAllFacilitiesForUser(req.clientId, parseInt(userId));
        }
        facilityIds = makeIdList(allFacilities, 'id');
        const lastFacility = await Facilities.getLastFacilityForUser(req.clientId, parseInt(userId));
        if (lastFacility[0] === undefined) {
            res.status(200).json(allFacilities);
        } else {
            if (facilityIds.includes(lastFacility[0].facility_id)) {
                const facilitiesMapped = lastFacilityMapping(allFacilities, lastFacility[0].facility_id);
                res.status(200).json(facilitiesMapped);
            } else {
                res.status(200).json(allFacilities);
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditFacility(req: Request, res: Response) {
    try {
        let response;
        if (req.body.id > 0) {
            response = await Facilities.editFacility(req.clientId, req.body);
            Assets.renameRootAsset(req.clientId, req.body.name, req.body.id);
            await updateFieldData(req.clientId, req.body.id, req.body.fieldData);
        } else {
            response = await Facilities.postFacility(req.clientId, req.body);
            await updateFieldData(req.clientId, response.insertId, req.body.fieldData);
            const asset = await Assets.insertAsset(req.clientId, 0, response.insertId, req.body.name, '', null);
            await AssetRelations.insertRoot(req.clientId, asset.insertId, response.insertId);
            await AssetRelations.insertSelf(req.clientId, asset.insertId, response.insertId);
        }
        const facilityId = req.body.id ? req.body.id : response.insertId;
        if (req.userId) {
            Facilities.postLastFacility(req.clientId, { userId: req.userId.toString(), facilityId: facilityId });
        }
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true, newFacilityId: facilityId });
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
        const response = await Facilities.setAssignedUsers(req.clientId, req.body.facilityNo, req.body.assignedUsers);
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

export async function setLastFacility(req: Request, res: Response) {
    try {
        const response = await Facilities.postLastFacility(req.clientId, req.body);
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
