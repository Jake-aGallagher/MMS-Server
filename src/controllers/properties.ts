import { Request, Response } from 'express';
import * as Properties from '../models/properties';

export async function getAllProperties(req: Request, res: Response) {
    try {
        const allProperties = await Properties.getAllProperties();
        res.status(200).json(allProperties);
    } catch (err) {
        res.status(500).json({ message: 'Request failed' })
    }
}