import { Request, Response } from 'express';
import * as Files from '../models/files';
import { v4 as uuidv4 } from 'uuid';
import Hashids from 'hashids';
import { getFileIds } from '../helpers/files/getFileIds';
import { getBlockBlobClient } from '../blobStorage/blobStorageClient';
import { postFileMappings } from '../models/files';

export async function getFile(req: Request, res: Response) {
    downloadFile(res, req.params.fileid, 'attachment');
}

export async function getImage(req: Request, res: Response) {
    downloadFile(res, req.params.imageid, 'inline');
}

async function downloadFile(res: Response, id: string, type: 'attachment' | 'inline') {
    try {
        const hashIds = new Hashids('file', 8);
        const imageId = hashIds.decode(id)[0];
        const fileDetails = await Files.getFileDetails(imageId);
        const { blockBlobClient, fileSize } = await getBlockBlobClient(fileDetails.location_name);
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': (type === 'attachment' ? `attachment; ` : `inline; `) + `filename="${fileDetails.file_name}"`,
            'Content-Length': fileSize
        });

        const downloadResponse = await blockBlobClient.download(0);
        if (downloadResponse && downloadResponse.readableStreamBody) {
            downloadResponse.readableStreamBody.pipe(res);
        } else {
            res.status(404).send('File not found');
        }
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
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        req.body = JSON.parse(req.body.data);
        const returnData = await uploadFile(req.file);
        await postFileMappings('file', [returnData.insertId], req.body.model, req.body.id);
        res.status(201).json({ created: true });
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

export async function postFieldFile(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const returnData = await uploadFile(req.file);
        const hashIds = new Hashids('file', 8);
        res.status(201).json({ fileId: returnData.insertId, encodedId: hashIds.encode(returnData.insertId), fileName: req.file.originalname });
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}

async function uploadFile(file: Express.Multer.File) {
    const client_id = 'MMBG/';
    const blobName: string = client_id + uuidv4() + '___' + file.originalname.toLowerCase().split(' ').join('-');
    const { blockBlobClient, fileSize } = await getBlockBlobClient(blobName);
    const stream = file.buffer;
    await blockBlobClient.upload(stream, stream.length);
    return await Files.postFile({ originalname: file.originalname, mimetype: file.mimetype, blobName, blobSize: fileSize.toString() });
}

export async function postSignature(req: Request, res: Response) {
    try {
        const data = req.body.signature;
        const splitDataURL = data.split(',');
        const decodedData = Buffer.from(splitDataURL[1], 'base64');
        const client_id = 'MMBG/';
        const fileName = client_id + uuidv4() + '__signature.jpg';
        const { blockBlobClient } = await getBlockBlobClient(fileName);
        await blockBlobClient.upload(decodedData, decodedData.length);
        const response = await Files.postFile({ originalname: 'signature.jpg', mimetype: 'image/jpeg', blobName: fileName, blobSize: decodedData.length.toString() });
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
        const fileDetails = await Files.getFileDetails(fileId);
        const { blockBlobClient } = await getBlockBlobClient(fileDetails.location_name);
        await blockBlobClient.delete();
        await Files.deleteFile(fileId);
        res.status(200).send();
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
}
