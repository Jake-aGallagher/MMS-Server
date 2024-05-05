import { BlobServiceClient } from '@azure/storage-blob';

export async function getBlockBlobClient(blobName: string) {
    const connectionString = process.env.FILE_STORAGE_STRING;
    if (!connectionString) {
        throw new Error('No connection string found');
    }
    const containerName = 'documents';

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    let fileSize = 0;
    if (await blockBlobClient.exists()) {
        const blobProperties = await blockBlobClient.getProperties();
        fileSize = blobProperties.contentLength || 0;
    }
    return { blockBlobClient, fileSize };
}
