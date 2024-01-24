import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { writeFileSync, mkdirSync, existsSync, createReadStream } from 'fs';
import { resolve, dirname } from 'path';
import conf from '../../config';

class FileWriter {
  private static s3Client: S3Client;

  /**
   * Write data to a file in the prefixed directory.
   * @param subPath - The sub path inside the prefixed directory where the file will be written.
   * @param data - The data to be written to the file. It can be a string or a Buffer (array buffer view).
   */
  public static write(subPath: string, data: string | NodeJS.ArrayBufferView): void {
    // This method is legacy
    try {
      const filePath = resolve(subPath);
      // Ensure the directory exists before writing the file
      const directory = dirname(filePath);
      if (!existsSync(directory)) {
        mkdirSync(directory, { recursive: true });
      }
      writeFileSync(filePath, data);
      console.log(`File written successfully to: ${filePath}`);
    } catch (error) {
      console.error('Error writing the file:', error);
    }
  }

  /**
   * Write file to s3 bucket as a new object
   * @param path - The path inside the S3 bucket where the file will be written.
   * @param data - The data to be written to the file. It can be a string or a Buffer (array buffer view).
   */
  public static async writeToS3Bucket(path: string, data: string | NodeJS.ArrayBufferView): Promise<void> {
    if (!this.s3Client) {
      this.s3Client = new S3Client();
    }

    try {
      const body = typeof data === 'string' ? data : Buffer.from(data as ArrayBuffer);
      const command = new PutObjectCommand({
        Bucket: conf.media_bucket,
        Key: path,
        Body: body,
      });
      const response = await this.s3Client.send(command);
      console.log(`File written successfully to S3 bucket. ETag: ${response.ETag}`);
    } catch (error) {
      console.error('Error writing the file to S3 bucket:', error);
    }
  }
}

export { FileWriter };
