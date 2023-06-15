import { Request, Response } from 'express';
import * as Enums from '../models/enums';

export async function getEnumsForCreateJob(req: Request, res: Response) {
    try {
        const urgency = await Enums.getEnumOptions('urgency options');
        const types = await Enums.getEnumOptions('job types');
        res.status(200).json({types, urgency});
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Request failed' });
    }
}