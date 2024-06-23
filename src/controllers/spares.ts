import { Request, Response } from 'express';
import sparesWarningArray from '../helpers/spares/sparesWarningArray';
import deliveryMaps from '../helpers/spares/deliveryMaps';
import deliveryContents from '../helpers/spares/deliveryContents';
import * as Spares from '../models/spares';
import * as Suppliers from '../models/suppliers';
import * as Jobs from '../models/maintenance/jobs';
import * as Pms from '../models/maintenance/pms';
import * as DefaultGraphs from '../helpers/graphs/defaultGraphs';
import allSparesAddUsage from '../helpers/spares/allSparesAddUsage';
import deliveryArrivedUpdateStock from '../helpers/spares/deliveryArrivedUpdateStock';
import makeIdList from '../helpers/makeIdList';
import { getCustomFieldData, updateFieldData } from '../models/customFields';
import { RecentJobs } from '../types/maintenance/jobs';
import { RecentPms } from '../types/maintenance/PMs';

export async function getallSpares(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const spares = await Spares.getAllSpares(req.clientId, facilityId);
        const monthsOfData = 3; // hardcoded here but make in a way easy to use dynamicaly in future
        const sparesUsed = await Spares.getUsedRecently(req.clientId, facilityId, monthsOfData);
        const sparesFullDetails = allSparesAddUsage(spares, sparesUsed, monthsOfData);
        res.status(200).json(sparesFullDetails);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSpare(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.params.spareid);
        const facilityId = parseInt(req.params.facilityid);
        const spares = await Spares.getSpares(req.clientId, spareId);
        let recentJobs: RecentJobs[] = [];
        let recentPms: RecentPms[] = [];
        const recentJobNumbers = await Spares.getRecentTasksForSpare(req.clientId, facilityId, spareId, 'job');
        const recentPmNumbers = await Spares.getRecentTasksForSpare(req.clientId, facilityId, spareId, 'pm');
        const used6M = await DefaultGraphs.sparesUsed6M(req.clientId, spareId);
        const deliveryInfo = await Spares.getDeliveryInfoOfSpare(req.clientId, spareId, facilityId);
        if (recentJobNumbers.length > 0) {
            const jobIdList = makeIdList(recentJobNumbers, 'model_id');
            recentJobs = await Jobs.getRecentJobsByIds(req.clientId, jobIdList);
        }
        if (recentPmNumbers.length > 0) {
            const pmIdList = makeIdList(recentPmNumbers, 'model_id');
            recentPms = await Pms.getRecentPmsById(req.clientId, pmIdList);
        }
        const customFields = await getCustomFieldData(req.clientId, 'spare', spareId);
        res.status(200).json({ spares, customFields, recentJobs, recentPms, used6M, deliveryInfo });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getNote(req: Request, res: Response) {
    try {
        const noteId = req.params.noteid;
        const note = await Spares.getNote(req.clientId, parseInt(noteId));
        res.status(200).json(note);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSpareStock(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.params.spareid);
        const spareStock = await Spares.getSpareStock(req.clientId, spareId);
        res.status(200).send(spareStock);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Request failed' });
    }
}

export async function getSparesForUse(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const spares = await Spares.getAllSparesBasic(req.clientId, facilityId);
        res.status(200).json({ spares });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSparesNotes(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const sparesNotes = await Spares.getSparesNotes(req.clientId, facilityId);
        res.status(200).json(sparesNotes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSparesWarnings(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const monthsOfData = 3; // hardcoded here but make in a way easy to use dynamicaly in future
        const sparesUsed = await Spares.getUsedRecently(req.clientId, facilityId, monthsOfData);
        const sparesCount = await Spares.getSparesRemaining(req.clientId, facilityId);
        const dataArrays = sparesWarningArray(sparesCount, sparesUsed, monthsOfData);
        res.status(200).json({ outArray: dataArrays.outArray, warningsArray: dataArrays.warningsArray });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getDeliveries(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const deliveryToFind = parseInt(req.params.deliveryid);
        let deliveries;
        if (deliveryToFind > 0) {
            deliveries = await Spares.getDeliveryById(req.clientId, deliveryToFind);
        } else {
            deliveries = await Spares.getDeliveries(req.clientId, facilityId);
        }
        if (deliveries.length === 0) {
            res.status(200).json({deliveries: []});
        } else {
            const data = deliveryMaps(deliveries);
            const deliveryMap = data.deliveryMap;
            const deliveryIds = data.deliveryIds;
            const deliveriesWithContentsArr = data.deliveries;
            const deliveryItems = await Spares.getDeliveryItems(req.clientId, deliveryIds);
            const deliverywithContents = deliveryContents(deliveryItems, deliveriesWithContentsArr, deliveryMap);
            if (deliveryToFind > 0) {
                const suppliers = await Suppliers.getSuppliers(req.clientId, facilityId);
                res.status(200).json({ deliveries: deliverywithContents, suppliers });
            } else {
                res.status(200).json({deliveries: deliverywithContents});
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditDelivery(req: Request, res: Response) {
    try {
        const deliveryId = parseInt(req.body.id);
        const facilityId = parseInt(req.body.facilityId);
        const costMap = await Spares.getCostMapping(req.clientId, facilityId);
        let response;
        if (deliveryId === 0) {
            response = await Spares.addDelivery(req.clientId, req.body);
            await Spares.addDeliveryItems(req.clientId, response.insertId, req.body.contents, costMap);
        } else {
            response = await Spares.editDelivery(req.clientId, req.body);
            // update deliveryItems
            await Spares.updateDeliveryItems(req.clientId, deliveryId, req.body.contents, costMap);
        }
        if (req.body.arrived) {
            // add the items to stock
            const oldStockLevels = await Spares.getSparesRemainingToBeDelivered(req.clientId, deliveryId); // get delivery contents by using the delivery id
            const justArrivedStock = await Spares.getDeliveryItems(req.clientId, [deliveryId]);
            const updatedStock = deliveryArrivedUpdateStock(oldStockLevels, justArrivedStock);
            updatedStock.forEach((item) => Spares.adjustSpareStock(req.clientId, item.id, item.quant_remain));
        }
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function addEditSpare(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.body.id);
        let response;
        if (spareId === 0) {
            response = await Spares.addSpare(req.clientId, req.body);
            await updateFieldData(req.clientId, response.insertId, req.body.fieldData);
        } else {
            response = await Spares.editSpare(req.clientId, req.body);
            await updateFieldData(req.clientId, spareId, req.body.fieldData);
        }
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function adjustSpareStock(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.body.id);
        const newStockLevel = parseInt(req.body.newStock);
        const response = await Spares.adjustSpareStock(req.clientId, spareId, newStockLevel);
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function postNote(req: Request, res: Response) {
    try {
        const response = await Spares.postSparesNote(req.clientId, req.body);
        if (response.affectedRows == 1) {
            res.status(201).json({ created: true });
        } else {
            res.status(500).json({ created: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ created: false });
    }
}

export async function deleteSparesItem(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Spares.deleteSparesItem(req.clientId, id);
        Spares.deleteSparesUsed(req.clientId, id);
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

export async function deleteDelivery(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Spares.deleteDelivery(req.clientId, id);
        Spares.deleteDeliveryContents(req.clientId, id);
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

export async function deleteNote(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Spares.deleteNote(req.clientId, id);
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
