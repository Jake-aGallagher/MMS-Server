import { Request, Response } from 'express';
import * as Assets from '../models/assets';

export async function getPropertyRevenue(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const assets = await Assets.getAssetsWithRevenues(propertyId);
        res.status(200).json({ assets });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}