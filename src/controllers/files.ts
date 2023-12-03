import { Request, Response } from 'express';
import * as Files from '../models/files';
import path from 'path';
import Hashids from 'hashids';
import fs from 'fs/promises';
import { insertFiles } from '../helpers/files/insertFiles';
import { getFileIds } from '../helpers/files/getFileIds';

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
            insertFiles(req.files, req.body.model, req.body.id);
        }
        res.status(201).json({ created: true });
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function deleteFile(req: Request, res: Response) {
    try {
        const hashIds = new Hashids('file', 8);
        const fileId = hashIds.decode(req.body.id)[0];
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
