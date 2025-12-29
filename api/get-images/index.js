const { ContainerClient } = require("@azure/storage-blob");

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = async function (context, req) {
    const sasUrl = process.env.BLOB_SAS_URL;

    if (!sasUrl) {
        context.res = {
            status: 500,
            body: "BLOB_SAS_URL is not defined"
        };
        return;
    }

    try {
        const containerClient = new ContainerClient(sasUrl);
        const blobs = [];

        for await (const blob of containerClient.listBlobsFlat()) {
            // Filter for image files if needed, or just return all
            if (blob.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                blobs.push({
                    name: blob.name,
                    url: `${containerClient.url}/${blob.name}` // This might be wrong if SAS is on container
                });
            }
        }
        
        // Construct public URLs. 
        // The SAS URL is for the container. 
        // The public URL for a blob in $web container is usually https://<account>.z1.web.core.windows.net/<blobname>
        // OR https://<account>.blob.core.windows.net/$web/<blobname>
        // But since we have a SAS token, we might need to append it if the container is private.
        // However, $web is usually for static websites and public.
        // Let's assume the blobs are public or we return the SAS URL for each blob.
        
        // Actually, the user provided a SAS URL for the container.
        // If the container is private, we need to append the SAS token to each blob URL.
        // If it's public (like $web usually is for static sites), we can just use the URL.
        // The SAS token provided has `sr=c` (resource = container).
        
        // Let's parse the SAS URL to get the base URL and the SAS token.
        const urlParts = sasUrl.split('?');
        const baseUrl = urlParts[0];
        const sasToken = urlParts[1];

        const imageUrls = blobs.map(blob => {
            return {
                name: blob.name,
                url: `${baseUrl}/${blob.name}?${sasToken}`
            };
        });

        context.res = {
            body: imageUrls
        };

    } catch (error) {
        context.log.error("Error listing blobs: ", error);
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};
