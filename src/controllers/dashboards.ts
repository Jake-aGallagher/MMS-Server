import { Request, Response } from 'express';
import * as Dashboard from '../models/dashboards';

export async function getDashboardJobs(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        // raised completed open
        const raised = await Dashboard.get6MPropertyGraph(propertyId, 'raisedJobs');
        const open = await Dashboard.getIncomplete(propertyId);
        const completed = await Dashboard.get6MPropertyGraph(propertyId, 'completeJobs', true);
        const breakdownVsPlanned = await Dashboard.getBreakdownVsPlanned(propertyId);

        res.status(200).json({ raised, open, completed, breakdownVsPlanned });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDashboardRevenue(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const revenue = await Dashboard.get6MPropertyGraph(propertyId, 'revenue');
        const downtime = await Dashboard.get6MPropertyGraph(propertyId, 'downtime');
        const assetRevenue = await Dashboard.getAssetLostRevenue(propertyId);
        res.status(200).json({ revenue, downtime, assetRevenue });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDashboardSpares(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const sparesCost = await Dashboard.get6MPropertyGraph(propertyId, 'sparesCost');
        const missingSpares = await Dashboard.get6MPropertyGraph(propertyId, 'sparesMissing');
        res.status(200).json({ sparesCost, missingSpares });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}
