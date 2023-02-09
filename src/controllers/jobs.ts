import { Request, Response } from 'express';
import * as Jobs from '../models/jobs';
import * as Enums from '../models/enums';
import * as Properties from '../models/properties';
import * as Users from '../models/users';
import * as Spares from '../models/spares';

export async function getAllJobs(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const allJobs = await Jobs.getAllJobs(propertyId);
        res.status(200).json(allJobs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

interface TimeDetailsFull {
    id: number;
    time: number;
    first: string;
    last: string;
}

export async function getJobDetails(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const jobDetails = await Jobs.getJobDetails(id);
        const timeDetails = await Jobs.getLoggedTimeDetails(id);
        let userIds = <number[]>[];
        if (timeDetails.length > 0) {
            timeDetails.forEach((pair) => {
                userIds.push(pair.id);
            });
            const users = await Users.getUsersByIds(userIds);
            let timeDetailsFull = <TimeDetailsFull[]>[];
            timeDetails.map((pair) => {
                const i = users.findIndex((j) => j.id === pair.id);
                if (i > -1) {
                    timeDetailsFull.push({ id: pair.id, time: pair.time, first: users[i].first, last: users[i].last });
                } else {
                    timeDetailsFull.push({ id: pair.id, time: pair.time, first: 'Unknown', last: 'Unknown' });
                }
            });
            res.status(200).json({ jobDetails, timeDetails: timeDetailsFull });
        } else {
            res.status(200).json({ jobDetails });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getJobUpdate(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.jobid);
        const propertyId = parseInt(req.params.propertyid);
        const statusOptions = await Enums.getStatusOptions();
        const jobDetails = await Jobs.getJobDetails(id);
        const users = await Properties.getAssignedUsers(propertyId);
        const timeDetails = await Jobs.getLoggedTimeDetails(id);
        const usedSpares = await Spares.getUsedSpares(id);
        if (timeDetails.length > 0) {
            res.status(200).json({ statusOptions, jobDetails, users, usedSpares, timeDetails });
        } else {
            res.status(200).json({ statusOptions, jobDetails, users, usedSpares });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postJob(req: Request, res: Response) {
    try {
        const urgencyReq = req.body.urgency;
        const urgency = await Enums.getUrgencyPayload(urgencyReq);
        const response = await Jobs.postJob(req.body, urgency);
        // @ts-ignore
        if (response.affectedRows == '1') {
            // @ts-ignore
            res.status(201).json({ created: true, jobId: response.insertId });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

interface NewSpares {
    id: number;
    part_no: string;
    name: string;
    num_used: number;
}

interface NewStock {
    id: number;
    property_id: number;
    quant_remain: number;
}

export async function updateAndComplete(req: Request, res: Response) {
    try {
        const jobId = req.body.id;
        const propertyId = req.body.propertyId;
        const newSpares = <NewSpares[]>req.body.sparesUsed;
        const response = await Jobs.updateAndComplete(req.body);
        
        if (newSpares.length > 0) {
            const prevSpares = await Spares.getUsedSpares(parseInt(jobId));
            const stockArray = <{ id: number; used: number }[]>[];
            if (prevSpares.length === 0) {
                newSpares.forEach((spare) => {
                    stockArray.push({id: spare.id, used: spare.num_used})
                })
                if (newSpares.length > 0) {
                    await Spares.insertUsedSpares(newSpares, parseInt(jobId));
                }
            } else {
                // compare difference
                const diffArray = <NewSpares[]>[];
                newSpares.forEach((newSpare) => {
                    const data = prevSpares.find((x) => x.id === newSpare.id);
                    if (data) {
                        const difference = newSpare.num_used - data.num_used;
                        if (difference != 0) {
                            diffArray.push({ id: newSpare.id, part_no: newSpare.part_no, name: newSpare.name, num_used: newSpare.num_used });
                            stockArray.push({ id: newSpare.id, used: difference });
                        }
                    } else {
                        // add straight to diff array as it doesn't previously exist
                        diffArray.push({ id: newSpare.id, part_no: newSpare.part_no, name: newSpare.name, num_used: newSpare.num_used });
                        stockArray.push({ id: newSpare.id, used: newSpare.num_used });
                    }
                });
                // insert the diff array (Update replace)
                if (diffArray.length > 0) {
                    await Spares.updateUsedSpares(diffArray ,jobId)
                }
            }
            // insert stock array changes
            const stockChangeIds = <number[]>[]
            stockArray.forEach((item) => {
                stockChangeIds.push(item.id)
            })
            const currStock = await Spares.getCurrentSpecificStock(stockChangeIds, propertyId)
            const newStock = <NewStock[]>[]
            stockArray.forEach( (item) => {
                const data = currStock.find((x) => x.id === item.id);
                if (data) {
                    newStock.push({id: item.id, property_id: propertyId, quant_remain: data.quant_remain - item.used})
                }
            })
            if (newStock.length > 0) {
                await Spares.updateStock(newStock)
            }
        }

        if (req.body.logged_time_details.length > 0) {
            // @ts-ignore
            const timeDetails = await Jobs.setTimeDetails(req.body.logged_time_details, parseInt(req.body.id));
        }

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

export async function updateNotes(req: Request, res: Response) {
    try {
        const response = await Jobs.updateNotes(req.body);
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
