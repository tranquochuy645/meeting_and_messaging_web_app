import { ObjectId } from "mongodb";

interface MediaMetadata {
    uploaderId: ObjectId;
    privacy: string;
    uploadTimestamp: Date;
    [key: string]: any; // Generic key-value pairs for additional metadata
}

class Media {
    mediaUrl: string;
    mediaType: string;
    metadata: MediaMetadata;

    constructor(mediaUrl: string, mediaType: string, metadata: MediaMetadata) {
        // Ensure that uploaderId, privacy, and uploadTimestamp are provided in the metadata
        const { uploaderId, privacy, uploadTimestamp, ...additionalMetadata } = metadata;
        if (!uploaderId || !privacy || !uploadTimestamp) {
            throw new Error("uploaderId, privacy, and uploadTimestamp are required in metadata.");
        }

        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.metadata = {
            uploaderId,
            privacy,
            uploadTimestamp,
            ...additionalMetadata,
        };
    }
}

export default Media;
