import * as Files from '../../models/files';

export const insertFiles = async (fileList: Express.Multer.File[], toType: string, toId: number) => {
    const fileIdList = <number[]>[];
    // save files
    for (const file of fileList) {
        const fileResponse = await Files.postFile(file);
        fileIdList.push(fileResponse.insertId);
    }
    // save file mappings
    await Files.postFileMappings('file', fileIdList, toType, toId)
    return;
} 
