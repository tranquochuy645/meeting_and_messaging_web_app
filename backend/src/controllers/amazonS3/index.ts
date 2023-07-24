import AWS from 'aws-sdk';
import { Readable } from 'stream';

interface S3Config {
    aws_region: string;
    aws_accessKeyId: string;
    aws_secretAccessKey: string;
}

class S3Controller {
    private static instance: S3Controller;
    private s3: AWS.S3;

    private constructor() {
        // Private constructor to enforce singleton pattern
        this.s3 = new AWS.S3();
    }

    public static getInstance(): S3Controller {
        if (!S3Controller.instance) {
            S3Controller.instance = new S3Controller();
        }
        return S3Controller.instance;
    }

    public init(config: S3Config): void {
        AWS.config.update({
            region: config.aws_region,
            accessKeyId: config.aws_accessKeyId,
            secretAccessKey: config.aws_secretAccessKey,
        });
    }

    // Add your S3 methods here
}
const AWSControllerS3 = S3Controller.getInstance();

export default AWSControllerS3;
