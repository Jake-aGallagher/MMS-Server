import { Request, Response } from 'express';
import * as Files from '../models/files';
import path from 'path';
import Hashids from 'hashids';
import fs from 'fs/promises';

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
