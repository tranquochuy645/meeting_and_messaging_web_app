import { config } from 'dotenv';
config();

interface EnvProps {
    jwt_key: string;
    mongo_uri: string;
    db_name: string;
    aws_region: string;
    aws_accessKeyId: string;
    aws_secretAccessKey: string;
    port: string;
}

const conf: EnvProps = {
    jwt_key: process.env.JWT_KEY || "",
    mongo_uri: process.env.MONGO_URI || "",
    db_name: process.env.DB_NAME || "",
    aws_region: process.env.AWS_REGION || "",
    aws_accessKeyId: process.env.AWS_ACCESS_KEY || "",
    aws_secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    port: process.env.PORT || ""
};

// Validate if any child property is null or undefined
for (const prop in conf) {
    if (conf.hasOwnProperty(prop) && (conf as any)[prop] == "") {
        // throw new Error(`Missing configuration: ${prop}`);
        console.error(`Missing configuration: ${prop}`);
    }
}

export default conf