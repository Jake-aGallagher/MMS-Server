import { Request, Response } from 'express';
import * as Spares from '../models/spares'

export async function getallSpares(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const spares = await Spares.getAllSpares(parseInt(propertyId));
        res.status(200).json(spares);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSpare(req: Request, res: Response) {
    try {
        const spareId = req.params.spareid;
        const spares = await Spares.getSpares(parseInt(spareId));
        res.status(200).json(spares);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSparesForUse(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyId);
        const jobId = parseInt(req.params.jobId);
        const spares = await Spares.getAllSparesBasic(propertyId);
        const usedSpares = await Spares.getUsedSpares(jobId)
        res.status(200).json({spares, usedSpares});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}