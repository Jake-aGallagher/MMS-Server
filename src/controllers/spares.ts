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
        let deliveryIds = <number[]>[];
        let deliveryMap: { [key: number]: number } = {};
        for (let i = 0; i < deliveries.length; i += 1) {
            deliveryMap[deliveries[i].id] = i;
            deliveryIds.push(deliveries[i].id);
            deliveries[i]['contents'] = <{ delivery_id: number; spare_id: number; quantity: number; part_no: string; name: string }[]>[];
        }
        if (deliveryIds.length > 0) {
            const deliveryItems = await Spares.getDeliveryItems(deliveryIds);
            deliveryItems.forEach((item) => {
                deliveries[deliveryMap[item.delivery_id]].contents.push(item);
            });
        }
        res.status(200).json(deliveries);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function addEditDelivery(req: Request, res: Response) {
    try {
        const deliveryId = parseInt(req.body.deliveryId);
        let response;
        let insertedItems;
        if (deliveryId === 0) {
            response = await Spares.addDelivery(req.body);
            console.log('this is the response: ', response);
            /// @ts-ignore
            insertedItems = await Spares.addDeliveryItems(response.insertId, req.body.contents);
            console.log(insertedItems);
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
