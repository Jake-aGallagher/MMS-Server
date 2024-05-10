import * as Files from '../../models/files';
import Hashids from 'hashids';

export const getFileIds = async (clientId: string, modelType: string, modelId: number) => {
    const MappedFiles = await Files.getMappedFiles(clientId, modelType, modelId);
    const hashIds = new Hashids('file', 8);
    const files = MappedFiles.map((item) => ({ id: hashIds.encode(item.id), name: item.file_name }));
    return files;
};
