import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
const DIR = process.env.FILE_DEST || 'uploads/';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, uuidv4() + '__' + fileName)
    }
});

const acceptableTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export const fileUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (acceptableTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});