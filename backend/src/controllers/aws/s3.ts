import { S3Client } from "@aws-sdk/client-s3";
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader';
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
    if (region) {
        s3Client = new S3Client({ region });
        return;
    }
    loadSharedConfigFiles()
        .then(r => {
            console.log("Loaded default aws config: ")
            console.log(r.configFile?.["default"]);
            s3Client = new S3Client({ region: r.configFile?.["default"]?.region });
        })
}
export { s3Client, s3Init, writeToS3Bucket };