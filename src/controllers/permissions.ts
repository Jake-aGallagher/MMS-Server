import { Request, Response } from "express";
import * as Permissions from '../models/permissions'
import assignedIdsList from "../helpers/assignedIdsList";
import setToSelected from "../helpers/permissions/setToSelected";

export async function getAllPermissionsForGroup(req: Request, res: Response) {
    try {
        const groupId = parseInt(req.params.groupid);
        const allPermissions = await Permissions.getAllPermissions();
        const selectedPermissions = await Permissions.getPermissionsForGroup(groupId);
        const assignedIds = assignedIdsList(selectedPermissions);
        const permissionsList = setToSelected(allPermissions, assignedIds);
        res.status(200).json({ permissionsList });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function setPermissionsForGroup(req: Request, res: Response) {
    try {
        const response = await Permissions.setPermissionsForGroup(req.body.userGroupId, req.body.assignedPermissions);
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