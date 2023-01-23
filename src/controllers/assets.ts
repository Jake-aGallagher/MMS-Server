import { RowDataPacket } from 'mysql2';
import { Request, Response } from 'express';
import * as Assets from '../models/assets';

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
