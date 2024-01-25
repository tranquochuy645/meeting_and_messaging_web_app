import { GetBucketLocationCommand, S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import conf from "../../config";

let s3Client: S3Client | undefined;

const getBucketRegion = async (bucketName: string) => {
    if (!s3Client) throw new Error("S3 client not available");
    try {
        // Use the GetBucketLocationCommand to get the region of the specified bucket
        const command = new GetBucketLocationCommand({ Bucket: bucketName });
        const response = await s3Client.send(command);
        console.log("Get region of " + conf.media_bucket + " returned: ");
        console.log(response);

        // Extract the region from the response
        const region = response.LocationConstraint || conf.default_region;

        return region;
    } catch (error) {
        console.error('Error getting bucket region:', error);
        throw error;
    }
}
const writeToS3Bucket = async (path: string, data: string | ArrayBuffer) => {
    if (!s3Client) throw new Error("S3 client not available");
    const body = typeof data === 'string' ? data : Buffer.from(data);
    const command = new PutObjectCommand({
        Bucket: conf.media_bucket,
        Key: path,
        Body: body,
    });
    const response = await s3Client.send(command);
    console.log(`File written successfully to S3 bucket. ETag: ${response.ETag}`);
}
const s3Init = async (region: string | null = null) => {
    if (region) {
        s3Client = new S3Client({ region });
        return;
    }
    const s3region = await getBucketRegion(conf.media_bucket);
    s3Client = new S3Client({ region: s3region });
    console.log("initialized s3Client as region: " + s3region);
}
export { s3Client, s3Init, writeToS3Bucket };