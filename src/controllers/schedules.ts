import { Request, Response } from 'express';
import * as Schedules from '../models/schedules';

export async function getAllSchedules(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const schedules = await Schedules.getAllSchedules(propertyId);
        res.status(200).json(schedules);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}