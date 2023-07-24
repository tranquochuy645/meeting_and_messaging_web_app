import { ObjectId } from "mongodb";
import { CollectionReference } from "./generic";
import Media from "../../../../lib/newMediaConstructor";

export default class MediaController extends CollectionReference {
    /**
     * Save media in the media collection.
         * @returns A Promise resolving to the ID of the inserted media document.
     */
    public async saveMedia(
        media: Media
    ): Promise<ObjectId> {
        try {
            // Ensure that uploaderId, privacy, and uploadTimestamp are provided in the metadata
            // const { uploaderId, privacy, uploadTimestamp } = media.metadata;
            // if (!uploaderId || !privacy || !uploadTimestamp) {
            //     throw new Error("uploaderId, privacy, and uploadTimestamp are required in metadata.");
            // }
            // Already validated by the media constructor
            // Insert the document into the collection and retrieve the inserted ID
            const result = await this._collection?.insertOne(media);

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
     *          Returns null if the media with the provided ID is not found or access is denied.
     */
    public async getMediaById(mediaId: string, whoAsked?: string): Promise<Media | null> {
        if (!ObjectId.isValid(mediaId)) {
            throw new Error("Invalid media id");
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
            throw new Error("Invalid user id");
        }

        // If whoAsked is provided, check the privacy before returning the media document
        const media = await this._collection?.findOne({
            _id: new ObjectId(mediaId),
        }) as Media | null;

        if (!media) {
            return null; // Media not found
        }

        if (media.metadata?.privacy === "private" && media.metadata?.uploaderId.toString() !== whoAsked) {
            return null; // Access denied for private media
        }

        return media;
    }

    public async renewUrl(mediaId: string, newUrl: string): Promise<number> {
        try {
            const result = await this._collection?.updateOne(
                { _id: new ObjectId(mediaId) },
                { mediaUrl: newUrl }
            )
            return result.modifiedCount
        } catch (err) {
            throw err
        }
    }
}
