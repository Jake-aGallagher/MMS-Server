import { Request, Response } from 'express';
import * as Spares from '../models/spares';

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

export async function getNote(req: Request, res: Response) {
    try {
        const noteId = req.params.noteid;
        const note = await Spares.getNote(parseInt(noteId));
        res.status(200).json(note);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSparesForUse(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const jobId = parseInt(req.params.jobId);
        const spares = await Spares.getAllSparesBasic(propertyId);
        const usedSpares = await Spares.getUsedSpares(jobId);
        res.status(200).json({ spares, usedSpares });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSparesNotes(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const sparesNotes = await Spares.getSparesNotes(propertyId);
        res.status(200).json(sparesNotes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

interface WarningArrays {
    id: number;
    part_no: string;
    name: string;
    supplier: string;
    quant_remain: number;
    monthly_usage: number | string;
}

export async function getSparesWarnings(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const monthsOfData = 3; // hardcoded here but make in a way easy to use dynamicaly in future
        const sparesUsed = await Spares.getUsedRecently(propertyId, monthsOfData);
        const sparesCount = await Spares.getSparesRemaining(propertyId);

        const warningsArray = <WarningArrays[]>[];
        const outArray = <WarningArrays[]>[];
        sparesCount.forEach((item) => {
            const data = sparesUsed.find((x) => x.spare_id === item.id);
            if (item.quant_remain === 0) {
                outArray.push({
                    id: item.id,
                    part_no: item.part_no,
                    name: item.name,
                    supplier: item.supplier,
                    quant_remain: item.quant_remain,
                    monthly_usage: data?.total_used ? Math.round((data.total_used / monthsOfData + Number.EPSILON) * 100) / 100 : 'Unknown',
                });
            } else {
                if (data) {
                    if (item.quant_remain / (data.total_used / monthsOfData) <= 1) {
                        warningsArray.push({
                            id: item.id,
                            part_no: item.part_no,
                            name: item.name,
                            supplier: item.supplier,
                            quant_remain: item.quant_remain,
                            monthly_usage: Math.round((data.total_used / monthsOfData + Number.EPSILON) * 100) / 100,
                        });
                    }
                }
            }
        });

        res.status(200).json({ outArray, warningsArray });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSuppliers(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const suppliers = await Spares.getSuppliers(propertyId);
        res.status(200).json(suppliers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postNote(req: Request, res: Response) {
    try {
        const response = await Spares.postSparesNote(req.body);
        // @ts-ignore
        if (response.affectedRows == '1') {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function deleteNote(req: Request, res: Response) {
    try {
        const deleted = await Spares.deleteNote(req.body);
        // @ts-ignore
        if (deleted.affectedRows > 0) {
            res.status(200).json({ deleted: true });
        } else {
            res.status(500).json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ deleted: false });
    }
}
