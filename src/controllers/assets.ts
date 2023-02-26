import { RowDataPacket } from 'mysql2';
import { Request, Response } from 'express';
import * as Assets from '../models/assets';
import * as AssetRelations from '../models/assetRelations';
import * as Jobs from '../models/jobs';

interface Asset extends RowDataPacket {
    id: number;
    parentId: number;
    name: string;
    breadcrumbs: number[];
    children: null | [];
}

export async function getAssetTree(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const getAssetTree = await Assets.getAssetTree(parseInt(propertyId), 0);

        function makeTree(list: Asset[]) {
            var map: { [key: number]: number } = {},
                roots = [],
                asset,
                i;

            for (i = 0; i < list.length; i += 1) {
                map[list[i].id] = i;
            }

            for (i = 0; i < list.length; i += 1) {
                asset = list[i];
                if (asset.parentId !== 0) {
                    if (list[map[asset.parentId]].children === null) {
                        list[map[asset.parentId]].children = [];
                    } // @ts-ignore
                    list[map[asset.parentId]].children.push(asset);
                } else {
                    asset.children = [];
                    roots.push(asset);
                }
            }
            return roots;
        }

        const tree = makeTree(getAssetTree);
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

            const idsForRecents = <number[]>[];
            const getChildren = await AssetRelations.getChildren(assetId);
            getChildren.forEach((i) => {
                idsForRecents.push(i.descendant_id);
            });

            const recentJobs = await Jobs.getRecentJobs(idsForRecents);
            const children = await Assets.getAssetTree(propertyId, assetId);

            function makeTree(list: Asset[]) {
                var map: { [key: number]: number } = {},
                    roots = [],
                    asset,
                    i;

                for (i = 0; i < list.length; i += 1) {
                    map[list[i].id] = i;
                }

                for (i = 0; i < list.length; i += 1) {
                    asset = list[i];
                    if (asset.parentId != assetId) {
                        if (list[map[asset.parentId]].children === null) {
                            list[map[asset.parentId]].children = [];
                        } // @ts-ignore
                        list[map[asset.parentId]].children.push(asset);
                    } else {
                        asset.children = [];
                        roots.push(asset);
                    }
                }
                return roots;
            }
            const tree = makeTree(children);
            res.status(200).json({ assetDetails, recentJobs, tree });
        } else {
            res.status(500).json({ message: 'Request failed' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function insertAsset(req: Request, res: Response) {
    const parentId = parseInt(req.body.parentId);
    const propertyId = parseInt(req.body.propertyId);
    const name = req.body.name;

    try {
        const asset = await Assets.insertAsset(parentId, propertyId, name);
        // @ts-ignore
        if (asset.affectedRows == 1) {
            // @ts-ignore
            const assetId = asset.insertId;
            if (parentId != 0) {
                const assetRelations = await AssetRelations.insertChild(assetId, propertyId, parentId);
                // @ts-ignore
                if ((assetRelations.affectedRows = 0)) {
                    res.status(500).json({ created: false });
                } else {
                    const response = await AssetRelations.insertSelf(assetId, propertyId);
                    // @ts-ignore
                    if (response.affectedRows == 1) {
                        res.status(201).json({ created: true });
                    } else {
                        res.status(500).json({ created: false });
                    }
                }
            } else {
                const response = await AssetRelations.insertSelf(assetId, propertyId);
                // @ts-ignore
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

export async function renameAsset(req: Request, res: Response) {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const renamed = await Assets.renameAsset(parseInt(id), name);
        // @ts-ignore
        if (renamed.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function EditAssetNote(req: Request, res: Response) {
    try {
        const assetId = parseInt(req.body.id);
        const response = await Assets.editAssetNote(assetId, req.body.note)
        // @ts-ignore
        if (response.affectedRows == '1') {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function deleteAsset(req: Request, res: Response) {
    const id = parseInt(req.body.id);
    const deleteType = req.body.deleteType;

    try {
        // get all relations for the id to be deleted to find children
        const idsForDelete = <number[]>[];
        const getChildren = await AssetRelations.getChildren(id);
        getChildren.forEach((i) => {
            idsForDelete.push(i.descendant_id);
        });

        // delete all relations
        const deletedRelations = await AssetRelations.deleteAssetRelations(idsForDelete);

        // delete all the assets that have had their relations deleted
        const deleted = await Assets.deleteAsset(idsForDelete);
        // @ts-ignore
        if (deleted.affectedRows > 0 && deletedRelations.affectedRows > 0) {
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
