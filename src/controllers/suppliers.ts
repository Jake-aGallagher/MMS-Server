import { Request, Response } from 'express';
import * as Suppliers from '../models/suppliers';

export async function getSuppliers(req: Request, res: Response) {
    try {
        const facilityId = parseInt(req.params.facilityid);
        const suppliers = await Suppliers.getSuppliers(req.clientId, facilityId);
        res.status(200).json(suppliers);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function getSuplierInfo(req: Request, res: Response) {
    try {
        const supplierId = parseInt(req.params.supplierid);
        const supplierDetails = await Suppliers.getSupplierInfo(req.clientId, supplierId);
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
            response = await Suppliers.addSupplier(req.clientId, req.body);
        } else {
            response = await Suppliers.editSupplier(req.clientId, req.body);
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

export async function deleteSupplier(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await Suppliers.deleteSupplier(req.clientId, id);
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