import { ObjectId } from "mongodb";
import { CollectionReference } from "./generic";

interface MediaMetadata {
    uploaderId: ObjectId;
    privacy: string;
    uploadTimestamp: Date;
    [key: string]: any; // Generic key-value pairs for additional metadata
}
interface MediaDocument {
    _id: ObjectId;
    media: Buffer | Uint8Array;
    mediaType: string;
    metadata?: MediaMetadata;
}

export default class MediaController extends CollectionReference {

    /**
     * Save media in the media collection.
     * @param mediaBuffer - The media data as a Buffer or Uint8Array.
     * @param mediaType - The type of media being saved (e.g., "image", "video", "audio", etc.).
     * @param metadata - Additional metadata associated with the media (uploaderId, privacy, and uploadTimestamp are required).
     * @returns A Promise resolving to the ID of the inserted media document.
     */
    public async saveMedia(
        mediaBuffer: Buffer | Uint8Array,
        mediaType: string,
        metadata: MediaMetadata
    ): Promise<ObjectId> {
        try {
            // Ensure that uploaderId, privacy, and uploadTimestamp are provided in the metadata
            const { uploaderId, privacy, uploadTimestamp, ...additionalMetadata } = metadata;
            if (!uploaderId || !privacy || !uploadTimestamp) {
                throw new Error("uploaderId, privacy, and uploadTimestamp are required in metadata.");
            }

            // Create the document to be inserted into the collection
            const mediaDocument: { media: Buffer | Uint8Array; mediaType: string; metadata: MediaMetadata } = {
                media: mediaBuffer,
                mediaType,
                metadata: {
                    uploaderId,
                    privacy,
                    uploadTimestamp,
                    ...additionalMetadata,
                },
            };

            // Insert the document into the collection and retrieve the inserted ID
            const result = await this._collection?.insertOne(mediaDocument);

            // Return the inserted ID
            if (result && result.insertedId) {
                return result.insertedId;
            } else {
                throw new Error("Media insertion failed.");
            }
        } catch (err) {
            throw err;
        }
    }

    /**
 * Get media by its ID.
 * @param mediaId - The ID of the media document to retrieve.
 * @param whoAsked - The ID of the user requesting the media (optional).
 * @returns A Promise resolving to the media document (including media data and metadata).
 *          Returns undefined if the media with the provided ID is not found or access is denied.
 */
    public async getMediaById(mediaId: string, whoAsked?: string): Promise<MediaDocument | null> {
        if (!ObjectId.isValid(mediaId)) {
            throw new Error("Invalid media id")
        }
        if (!whoAsked) {
            //If whoAsked is not provided, only return the public media document
            return this._collection?.findOne(
                {
                    _id: new ObjectId(mediaId),
                    metadata: { privacy: 'public' }
                }
            ) as Promise<MediaDocument | null>;
        }
        if (!ObjectId.isValid(whoAsked)) {
            throw new Error("Invalid user id")
        }
        return this._collection?.findOne(
            {
                _id: new ObjectId(mediaId),
                metadata: { uploaderId: new ObjectId(whoAsked) }
            }
        ) as Promise<MediaDocument | null>;
    }
}
