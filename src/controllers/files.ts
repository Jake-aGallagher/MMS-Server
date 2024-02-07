import { Request, Response } from 'express';
import * as Files from '../models/files';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Hashids from 'hashids';
import fs from 'fs/promises';
import { insertFiles } from '../helpers/files/insertFiles';
import { getFileIds } from '../helpers/files/getFileIds';
import { FileUpload } from '../types/files';

export async function getFile(req: Request, res: Response) {
    try {
        const hashIds = new Hashids('file', 8);
        const fileId = hashIds.decode(req.params.fileid)[0];
        const fileDetails = await Files.getFilePath(fileId);
        const filePath = path.join(fileDetails[0].destination, fileDetails[0].location_name);
        res.status(200).download(filePath, fileDetails[0].file_name);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function getImage(req: Request, res: Response) {
    try {
        const hashIds = new Hashids('file', 8);
        const imageId = hashIds.decode(req.params.imageid)[0];
        const imageDetails = await Files.getFilePath(imageId);
        const filePath = path.join(__dirname, '..', '..', imageDetails[0].destination, imageDetails[0].location_name);
        res.status(200).sendFile(filePath);
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function getFilesForModel(req: Request, res: Response) {
    try {
        const model = req.params.model;
        const id = parseInt(req.params.id);
        const files = await getFileIds(model, id);
        res.status(200).json({ files });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Request failed' });
    }
}

export async function postFile(req: Request, res: Response) {
    try {
        req.body = JSON.parse(req.body.data);
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            await insertFiles(req.files, req.body.model, req.body.id);
        }
        res.status(201).json({ created: true });
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function postFieldFile(req: Request, res: Response) {
    try {
        if (req.files && Array.isArray(req.files) && req.files.length == 1) {
            const response = await Files.postFile(req.files[0]);
            const hashIds = new Hashids('file', 8);
            res.status(201).json({ fileId: response.insertId, encodedId: hashIds.encode(response.insertId), fileName: req.files[0].originalname });
        } else {
            res.status(400).json({ message: 'Invalid file' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function postSignature(req: Request, res: Response) {
    try {
        const data = req.body.signature;
        const splitDataURL = data.split(',');
        const decodedData = Buffer.from(splitDataURL[1], 'base64');
        const fileName = uuidv4() + '__signature.jpg';
        const filePath = path.join(__dirname, '..', '..', 'uploads', fileName);
        await fs.writeFile(filePath, decodedData);
        const response = await Files.postFile({ originalname: 'signature.jpg', mimetype: 'image/jpeg', destination: 'uploads', filename: fileName, size: decodedData.length } as FileUpload);
        const hashIds = new Hashids('file', 8);
        res.status(201).json({ fileId: response.insertId, encodedId: hashIds.encode(response.insertId), fileName: 'signature.jpg' });
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function deleteFile(req: Request, res: Response) {
    try {
        const hashIds = new Hashids('file', 8);
        const fileId = hashIds.decode(req.params.id)[0];
        const fileDetails = await Files.getFilePath(fileId);
        const filePath = path.join(fileDetails[0].destination, fileDetails[0].location_name);
        await fs.rm(filePath, { force: true });
        await Files.deleteFile(fileId);
        res.status(200).send();
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}
