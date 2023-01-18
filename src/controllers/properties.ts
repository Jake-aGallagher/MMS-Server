import { Request, Response } from 'express';
import * as Properties from '../models/properties';

export async function getAllProperties(req: Request, res: Response) {
    try {
        const allProperties = await Properties.getAllProperties();
        res.status(200).json(allProperties);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getPropertyDetails(req: Request, res: Response) {
    try {
        const propertyId = req.params.propertyid;
        const propDetails = await Properties.getPropertyDetails(parseInt(propertyId))
        res.status(200).json(propDetails)
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postProperty(req: Request, res: Response) {
    try {
        const response = await Properties.postProperty(req.body);
        // @ts-ignore
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function editProperty(req: Request, res: Response) {
    try {
        const response = await Properties.editProperty(req.body);
        // @ts-ignore
        if (response.affectedRows === 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ created: false })
    }
};