import { Request, Response } from 'express';
import * as Dashboard from '../models/dashboards';

export async function getDashboardJobs(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        // raised completed open
        const raised = await Dashboard.get6MFacilityGraph(req.clientId, facilityId, 'raisedJobs');
        const open = await Dashboard.getIncomplete(req.clientId, facilityId);
        const completed = await Dashboard.get6MFacilityGraph(req.clientId, facilityId, 'completeJobs', true);
        const breakdownVsPlanned = await Dashboard.getBreakdownVsPlanned(req.clientId, facilityId);

        res.status(200).json({ raised, open, completed, breakdownVsPlanned });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDashboardRevenue(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const revenue = await Dashboard.get6MFacilityGraph(req.clientId, facilityId, 'revenue');
        const downtime = await Dashboard.get6MFacilityGraph(req.clientId, facilityId, 'downtime');
        const assetRevenue = await Dashboard.getAssetLostRevenue(req.clientId, facilityId);
        res.status(200).json({ revenue, downtime, assetRevenue });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDashboardSpares(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const sparesCost = await Dashboard.get6MFacilityGraph(req.clientId, facilityId, 'sparesCost');
        const missingSpares = await Dashboard.get6MFacilityGraph(req.clientId, facilityId, 'sparesMissing');
        res.status(200).json({ sparesCost, missingSpares });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}
