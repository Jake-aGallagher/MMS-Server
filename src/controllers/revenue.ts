import { Request, Response } from 'express';
import * as Assets from '../models/maintenance/assets';

export async function getFacilityRevenue(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const assets = await Assets.getAssetsWithRevenues(req.clientId, facilityId);
        res.status(200).json({ assets });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}
