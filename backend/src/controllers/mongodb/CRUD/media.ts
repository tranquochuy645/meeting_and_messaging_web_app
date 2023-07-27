import { ObjectId } from "mongodb";
import { CollectionReference } from "./generic";

/**
 * Interface for the metadata associated with media.
 */
interface MediaMetadata {
    uploaderId: ObjectId;
    privacy: string;
    uploadTimestamp: Date;
    allowedUsers?: ObjectId[]; // Array of user IDs allowed to access the media (for private media)
    [key: string]: any; // Generic key-value pairs for additional metadata
}

/**
 * Represents a media document.
 */
class Media {
    mediaUrl: string;
    mediaType: string;
    metadata: MediaMetadata;

    /**
     * Create a new Media object.
     * @param mediaUrl - The URL or location of the media.
     * @param mediaType - The type of media (e.g., "image", "video", "audio", etc.).
     * @param metadata - Metadata associated with the media (uploaderId, privacy, and uploadTimestamp are required).
     *                  Optionally, specify allowedUsers for private media to specify who can access it.
     */
    constructor(mediaUrl: string, mediaType: string, metadata: MediaMetadata) {
        // Ensure that uploaderId, privacy, and uploadTimestamp are provided in the metadata
        const { uploaderId, privacy, uploadTimestamp, ...additionalMetadata } = metadata;
        if (!ObjectId.isValid(uploaderId)) {
            throw new Error("Invalid uploaderId.");
        }
        if (!privacy || !uploadTimestamp) {
            throw new Error("Privacy and uploadTimestamp are required in metadata.");
        }

        // Validate privacy field to contain only valid values
        if (privacy !== "public" && privacy !== "private") {
            throw new Error("Invalid value for privacy field. It should be 'public' or 'private'.");
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

/**
 * A controller for handling media operations and interactions with the media collection.
 */
export default class MediaController extends CollectionReference {
    /**
     * Save media in the media collection.
     * @param mediaUrl - The URL or location of the media.
     * @param mediaType - The type of media (e.g., "image", "video", "audio", etc.).
     * @param metadata - Metadata associated with the media (uploaderId, privacy, and uploadTimestamp are required).
     *                  Optionally, specify allowedUsers for private media to specify who can access it.
     * @returns A Promise resolving to the ID of the inserted media document.
     * @throws Error if the media insertion fails or metadata is invalid.
     */
    public async saveMedia(mediaUrl: string, mediaType: string, metadata: MediaMetadata): Promise<ObjectId> {
        try {
            const result = await this._collection?.insertOne(new Media(mediaUrl, mediaType, metadata));
            // Return the inserted ID
            if (result && result.insertedId) {
                return result.insertedId;
            }
            throw new Error("Media insertion failed.");
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get media by its ID.
     * @param mediaId - The ID of the media document to retrieve.
     * @param whoAsked - The ID of the user requesting the media (optional).
     * @returns A Promise resolving to the media document (including media data and metadata).
     *          Returns null if the media with the provided ID is not found or access is denied.
     * @throws Error if the mediaId or whoAsked is invalid.
     */
    public async getMediaById(mediaId: string, whoAsked?: string): Promise<Media | null> {
        if (!ObjectId.isValid(mediaId)) {
            throw new Error("Invalid mediaId.");
        }
        if (!whoAsked) {
            // If whoAsked is not provided, only return the public media document
            return this._collection?.findOne(
                {
                    _id: new ObjectId(mediaId),
                    "metadata.privacy": "public",
                }
            ) as Promise<Media | null>;
        }
        if (!ObjectId.isValid(whoAsked)) {
            throw new Error("Invalid user ID.");
        }

        // If whoAsked is provided, check the privacy and allowedUsers before returning the media document
        const media = await this._collection?.findOne({
            _id: new ObjectId(mediaId),
        }) as Media | null;

        if (!media) {
            return null; // Media not found
        }

        if (media.metadata?.privacy === "private") {
            // Check if the user is allowed to access private media
            const allowedUsers = media.metadata?.allowedUsers;
            if (!allowedUsers || !allowedUsers.includes(new ObjectId(whoAsked))) {
                return null; // Access denied for private media
            }
        }

        return media;
    }

    /**
     * Renew the URL or location of the media.
     * @param mediaId - The ID of the media document to update.
     * @param newUrl - The new URL or location to set for the media.
     * @returns A Promise resolving to the number of modified documents (1 if successful, 0 if not found).
     * @throws Error if the mediaId is invalid.
     */
    public async renewUrl(mediaId: string, newUrl: string): Promise<number> {
        try {
            const result = await this._collection?.updateOne(
                { _id: new ObjectId(mediaId) },
                { mediaUrl: newUrl }
            )
            return result.modifiedCount || 0;
        } catch (err) {
            throw err;
        }
    }
}
