import { Asset } from "../../types/assets";

export default function makeAssetTree(list: Asset[], parentAssetId = 0) {
    var map: { [key: number]: number } = {},
        roots = [],
        asset,
        i;

    for (i = 0; i < list.length; i += 1) {
        map[list[i].id] = i;
    }

    for (i = 0; i < list.length; i += 1) {
        asset = list[i];
        if (asset.parentId != parentAssetId) {
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