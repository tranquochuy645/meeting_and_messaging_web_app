import { GetBucketLocationCommand, S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import conf from "../../config";

let s3Client: S3Client | undefined;

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
    s3Client = new S3Client();
    console.log("initialized s3Client as region: ");
    console.log(s3Client.config.region);
}
export { s3Client, s3Init, writeToS3Bucket };