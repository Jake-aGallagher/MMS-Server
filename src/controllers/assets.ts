import { Request, Response } from 'express';
import * as Assets from '../models/assets';
import * as AssetRelations from '../models/assetRelations';
import * as Jobs from '../models/jobs';
import * as DefaultGraphs from '../helpers/graphs/defaultGraphs';
import makeAssetTree from '../helpers/assets/makeAssetTree';
import makeIdList from '../helpers/makeIdList';
import { getCustomFieldData, updateFieldData } from '../models/customFields';

export async function getAssetTree(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const getAssetTree = await Assets.getAssetTree(parseInt(propertyId), 0);
        const tree = makeAssetTree(getAssetTree);
        res.status(200).json(tree);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getAsset(req: Request, res: Response) {
    const assetId = parseInt(req.params.assetid);
    try {
        const assetDetails = await Assets.getAssetById(assetId);
        if (assetDetails.length > 0) {
            const propertyId = assetDetails[0].property_id;
            const getChildren = await AssetRelations.getChildren(assetId);
            const idsForRecents = makeIdList(getChildren, 'descendant_id');
            const recentJobs = await Jobs.getRecentJobs(idsForRecents);
            const children = await Assets.getAssetTree(propertyId, assetId);
            const tree = makeAssetTree(children, assetId);
            // Todo - batch graph calls
            const jobsOfComponents6M = await DefaultGraphs.jobsOfComponents6M([...idsForRecents, assetId]);
            const incompleteForAsset = await DefaultGraphs.incompleteForAsset([...idsForRecents, assetId]);
            // Custom Fields
            const customFields = await getCustomFieldData('asset', assetId);
            res.status(200).json({ assetDetails, customFields, recentJobs, tree, jobsOfComponents6M, incompleteForAsset });
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
            const edited = await Assets.editAsset(parseInt(req.body.id), req.body.name, req.body.note);
            await updateFieldData(req.body.id, req.body.fieldData);
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
        const propertyId = parseInt(req.body.propertyId);
        const name = req.body.name;

        try {
            const asset = await Assets.insertAsset(parentId, propertyId, name, req.body.note);
            await updateFieldData(asset.insertId, req.body.fieldData);
            if (asset.affectedRows == 1) {
                const assetId = asset.insertId;
                if (parentId != 0) {
                    const assetRelations = await AssetRelations.insertChild(assetId, propertyId, parentId);
                    if ((assetRelations.affectedRows = 0)) {
                        res.status(500).json({ created: false });
                    } else {
                        const response = await AssetRelations.insertSelf(assetId, propertyId);
                        if (response.affectedRows == 1) {
                            res.status(201).json({ created: true });
                        } else {
                            res.status(500).json({ created: false });
                        }
                    }
                } else {
                    const response = await AssetRelations.insertSelf(assetId, propertyId);
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
        const getChildren = await AssetRelations.getChildren(id);
        const idsForDelete = makeIdList(getChildren, 'descendant_id');

        // delete all relations
        await AssetRelations.deleteAssetRelations(idsForDelete);

        // delete all the assets that have had their relations deleted
        const deleted = await Assets.deleteAsset(idsForDelete);
        if (deleted.affectedRows > 0) {
            if (deleteType === 'assetAndJobs') {
                Jobs.deleteJobs(idsForDelete);
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
