import { Request, Response } from 'express';
import * as Dashboard from '../models/dashboards';

export async function getDashboardJobs(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        // raised completed open
        const raised = await Dashboard.getRaisedJobs(propertyId);
        const open = await Dashboard.getIncomplete(propertyId);
        const completed = await Dashboard.getCompletedJobs(propertyId);
        const breakdownVsPlanned = await Dashboard.getBreakdownVsPlanned(propertyId);

        res.status(200).json({ raised, open, completed, breakdownVsPlanned });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDashboardRevenue(req: Request, res: Response) {
    try {
        //const propertyId = req.params.propertyid;

        res.status(200).json({});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDashboardSpares(req: Request, res: Response) {
    try {
        //const propertyId = req.params.propertyid;

        res.status(200).json({});
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}
