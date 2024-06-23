import { Request, Response } from 'express';
import * as Assets from '../../models/maintenance/assets';
import * as AssetRelations from '../../models/maintenance/assetRelations';
import * as Jobs from '../../models/maintenance/jobs';
import * as Pms from '../../models/maintenance/pms';
import * as DefaultGraphs from '../../helpers/graphs/defaultGraphs';
import makeAssetTree from '../../helpers/assets/makeAssetTree';
import makeIdList from '../../helpers/makeIdList';
import { getCustomFieldData, updateFieldData } from '../../models/customFields';
import { RecentJobs } from '../../types/maintenance/jobs';
import { RecentPms } from '../../types/maintenance/PMs';

export async function getAssetTree(req: Request, res: Response) {
    try {
        const facilityId = req.params.facilityid;
        const getAssetTree = await Assets.getAssetTree(req.clientId, parseInt(facilityId), 0);
        const tree = makeAssetTree(getAssetTree);
        res.status(200).json(tree);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAssetsWithRevenues(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const assets = await Assets.getAssetsWithRevenues(req.clientId, facilityId);
        res.status(200).json({ assets });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAsset(req: Request, res: Response) {
    const assetId = parseInt(req.params.assetid);
    try {
        const assetDetails = await Assets.getAssetById(req.clientId, assetId);
        if (assetDetails.length > 0) {
            const facilityId = assetDetails[0].facility_id;
            const getChildren = await AssetRelations.getChildren(req.clientId, assetId);
            const idsForRecents = makeIdList(getChildren, 'descendant_id');
            let recentJobs: RecentJobs[] = [];
            let recentPms: RecentPms[] = [];
            if (idsForRecents.length > 0) {
                recentJobs = await Jobs.getRecentJobs(req.clientId, idsForRecents);
                recentPms = await Pms.getRecentPmsForAsset(req.clientId, idsForRecents);
            }
            const children = await Assets.getAssetTree(req.clientId, facilityId, assetId);
            const tree = makeAssetTree(children, assetId);
            // Todo - batch graph calls
            const jobsOfComponents6M = await DefaultGraphs.jobsOfComponents6M(req.clientId, [...idsForRecents, assetId]);
            const incompleteForAsset = await DefaultGraphs.incompleteForAsset(req.clientId, [...idsForRecents, assetId]);
            const customFields = await getCustomFieldData(req.clientId, 'asset', assetId);
            res.status(200).json({ assetDetails, customFields, recentJobs, recentPms, tree, jobsOfComponents6M, incompleteForAsset });
        } else {
            res.status(500).json({ message: 'Request failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditAsset(req: Request, res: Response) {
    if (req.body.id > 0) {
        try {
            const edited = await Assets.editAsset(req.clientId, parseInt(req.body.id), req.body.name, req.body.note, req.body.revenue);
            await updateFieldData(req.clientId, req.body.id, req.body.fieldData);
            if (edited.affectedRows == 1) {
                res.status(201).json({ created: true });
            } else {
                res.status(500).json({ created: false });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ created: false });
        }
    } else {
        const parentId = parseInt(req.body.parentId);
        const facilityId = parseInt(req.body.facilityId);
        const name = req.body.name;

        try {
            const asset = await Assets.insertAsset(req.clientId, parentId, facilityId, name, req.body.note, req.body.revenue);
            await updateFieldData(req.clientId, asset.insertId, req.body.fieldData);
            if (asset.affectedRows == 1) {
                const assetId = asset.insertId;
                if (parentId != 0) {
                    const assetRelations = await AssetRelations.insertChild(req.clientId, assetId, facilityId, parentId);
                    if ((assetRelations.affectedRows = 0)) {
                        res.status(500).json({ created: false });
                    } else {
                        const response = await AssetRelations.insertSelf(req.clientId, assetId, facilityId);
                        if (response.affectedRows == 1) {
                            res.status(201).json({ created: true });
                        } else {
                            res.status(500).json({ created: false });
                        }
                    }
                } else {
                    const response = await AssetRelations.insertSelf(req.clientId, assetId, facilityId);
                    if (response.affectedRows == 1) {
                        res.status(201).json({ created: true });
                    } else {
                        res.status(500).json({ created: false });
                    }
                }
            } else {
                res.status(500).json({ created: false });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ created: false });
        }
    }
}

export async function deleteAsset(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const deleteType = req.body.deleteType;

    try {
        // get all relations for the id to be deleted to find children
        const getChildren = await AssetRelations.getChildren(req.clientId, id);
        const idsForDelete = makeIdList(getChildren, 'descendant_id');
        if (idsForDelete.length === 0) {
            idsForDelete.push(id);
        }

        // delete all relations
        await AssetRelations.deleteAssetRelations(req.clientId, idsForDelete);

        // delete all the assets that have had their relations deleted
        const deleted = await Assets.deleteAsset(req.clientId, idsForDelete);
        if (deleted.affectedRows > 0) {
            if (deleteType === 'assetAndJobs') {
                Jobs.deleteJobs(req.clientId, idsForDelete);
            }
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}
