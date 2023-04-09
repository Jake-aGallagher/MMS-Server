import { Request, Response } from 'express';
import sparesWarningArray from '../helpers/spares/sparesWarningArray';
import deliveryMaps from '../helpers/spares/deliveryMaps';
import deliveryContents from '../helpers/spares/deliveryContents';
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
        const dataArrays = sparesWarningArray(sparesCount, sparesUsed, monthsOfData)
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

export async function getDeliveries(req: Request, res: Response) {
    try {
        const propertyId = parseInt(req.params.propertyid);
        const deliveries = await Spares.getDeliveries(propertyId);
        if (deliveries.length === 0) {
            res.status(200).json({});
        } else {
            const data = deliveryMaps(deliveries)
            const deliveryMap = data.deliveryMap
            const deliveryIds = data.deliveryIds
            const deliveriesWithContentsArr = data.deliveries
            const deliveryItems = await Spares.getDeliveryItems(deliveryIds);
            const deliverywithContents = deliveryContents(deliveryItems, deliveriesWithContentsArr, deliveryMap)
            res.status(200).json(deliverywithContents);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditDelivery(req: Request, res: Response) {
    try {
        const deliveryId = parseInt(req.body.deliveryId);
        let response;
        if (deliveryId === 0) {
            response = await Spares.addDelivery(req.body);
            /// @ts-ignore
            await Spares.addDeliveryItems(response.insertId, req.body.contents);
        } else {
            response = await Spares.editDelivery(req.body);
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

export async function addEditSpare(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.body.id);
        let response;
        if (spareId === 0) {
            response = await Spares.addSpare(req.body);
        } else {
            response = await Spares.editSpare(req.body);
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

export async function adjustSpareStock(req: Request, res: Response) {
    try {
        const spareId = parseInt(req.body.id);
        const newStockLevel = parseInt(req.body.newStock);
        const response = await Spares.adjustSpareStock(spareId, newStockLevel);
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

export async function deleteSupplier(req: Request, res: Response) {
    try {
        const deleted = await Spares.deleteSupplier(req.body);
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

export async function deleteSparesItem(req: Request, res: Response) {
    try {
        const deleted = await Spares.deleteSparesItem(req.body);
        Spares.deleteSparesUsed(req.body);
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
