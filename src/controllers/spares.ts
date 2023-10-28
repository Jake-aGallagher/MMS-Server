import { Request, Response } from 'express';
import sparesWarningArray from '../helpers/spares/sparesWarningArray';
import deliveryMaps from '../helpers/spares/deliveryMaps';
import deliveryContents from '../helpers/spares/deliveryContents';
import * as Spares from '../models/spares';
import * as Jobs from '../models/jobs';
import * as DefaultGraphs from '../helpers/graphs/defaultGraphs';
import allSparesAddUsage from '../helpers/spares/allSparesAddUsage';
import deliveryArrivedUpdateStock from '../helpers/spares/deliveryArrivedUpdateStock';
import makeIdList from '../helpers/makeIdList';
import { RowDataPacket } from 'mysql2';

export async function getallSpares(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const spares = await Spares.getAllSpares(propertyId);
        const monthsOfData = 3; // hardcoded here but make in a way easy to use dynamicaly in future
        const sparesUsed = await Spares.getUsedRecently(propertyId, monthsOfData);
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
        const propertyId = parseInt(req.params.propertyid);
        const spares = await Spares.getSpares(spareId);
        let recentJobs: RowDataPacket[] = [];
        const recentJobNumbers = await Spares.getRecentJobsForSpare(propertyId, spareId);
        const used6M = await DefaultGraphs.sparesUsed6M(spareId);
        if (recentJobNumbers.length > 0) {
            const jobIdList = makeIdList(recentJobNumbers, 'job_id');
            recentJobs = await Jobs.getRecentJobsByIds(jobIdList);
        }
        res.status(200).json({ spares, recentJobs, used6M });
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

export async function getSpareStock(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.params.spareid);
        const spareStock = await Spares.getSpareStock(spareId);
        res.status(200).send(spareStock);
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: 'Request failed' });
    }
}

export async function getSparesForUse(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const spares = await Spares.getAllSparesBasic(propertyId);
        res.status(200).json({ spares });
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

export async function getSparesWarnings(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const monthsOfData = 3; // hardcoded here but make in a way easy to use dynamicaly in future
        const sparesUsed = await Spares.getUsedRecently(propertyId, monthsOfData);
        const sparesCount = await Spares.getSparesRemaining(propertyId);
        const dataArrays = sparesWarningArray(sparesCount, sparesUsed, monthsOfData);
        res.status(200).json({ outArray: dataArrays.outArray, warningsArray: dataArrays.warningsArray });
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

export async function getSuplierInfo(req: Request, res: Response) {
    try {
        const supplierId = parseInt(req.params.supplierid);
        const supplierDetails = await Spares.getSupplierInfo(supplierId);
        res.status(200).json(supplierDetails);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditSupplier(req: Request, res: Response) {
    try {
        const supplierId = parseInt(req.body.id);
        let response;
        if (supplierId === 0) {
            response = await Spares.addSupplier(req.body);
        } else {
            response = await Spares.editSupplier(req.body);
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

export async function getDeliveries(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const deliveryToFind = parseInt(req.params.deliveryid);
        let deliveries;
        if (deliveryToFind > 0) {
            deliveries = await Spares.getDeliveryById(deliveryToFind);
        } else {
            deliveries = await Spares.getDeliveries(propertyId);
        }
        if (deliveries.length === 0) {
            res.status(200).json({});
        } else {
            const data = deliveryMaps(deliveries);
            const deliveryMap = data.deliveryMap;
            const deliveryIds = data.deliveryIds;
            const deliveriesWithContentsArr = data.deliveries;
            const deliveryItems = await Spares.getDeliveryItems(deliveryIds);
            const deliverywithContents = deliveryContents(deliveryItems, deliveriesWithContentsArr, deliveryMap);
            if (deliveryToFind > 0) {
                const suppliers = await Spares.getSuppliers(propertyId);
                res.status(200).json({ deliverywithContents, suppliers });
            } else {
                res.status(200).json(deliverywithContents);
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
        let response;
        if (deliveryId === 0) {
            response = await Spares.addDelivery(req.body);
            await Spares.addDeliveryItems(response.insertId, req.body.contents);
        } else {
            response = await Spares.editDelivery(req.body);
            // update deliveryItems
            const confirmDelete = await Spares.deleteDeliveryContents(deliveryId);
            if (confirmDelete) {
                await Spares.addDeliveryItems(deliveryId, req.body.contents);
            }
        }
        if (req.body.arrived) {
            // add the items to stock
            const oldStockLevels = await Spares.getSparesRemainingToBeDelivered(deliveryId); // get delivery contents by using the delivery id
            const justArrivedStock = await Spares.getDeliveryItems([deliveryId]);
            const updatedStock = deliveryArrivedUpdateStock(oldStockLevels, justArrivedStock);
            updatedStock.forEach((item) => Spares.adjustSpareStock(item.id, item.quant_remain));
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
            response = await Spares.addSpare(req.body);
        } else {
            response = await Spares.editSpare(req.body);
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
        const response = await Spares.adjustSpareStock(spareId, newStockLevel);
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
        const response = await Spares.postSparesNote(req.body);
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

export async function deleteSupplier(req: Request, res: Response) {
    try {
        const deleted = await Spares.deleteSupplier(req.body);
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

export async function deleteSparesItem(req: Request, res: Response) {
    try {
        const deleted = await Spares.deleteSparesItem(req.body);
        Spares.deleteSparesUsed(req.body);
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
        const deliveryId = parseInt(req.body.id);
        const deleted = await Spares.deleteDelivery(deliveryId);
        Spares.deleteDeliveryContents(deliveryId);
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
        const deleted = await Spares.deleteNote(req.body);
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
