import { config } from 'dotenv';
config();

interface EnvProps {
    jwt_key: string;
    mongo_uri: string;
    db_name: string;
    port: string;
}

const conf: EnvProps = {
    jwt_key: process.env.JWT_KEY || "",
    mongo_uri: process.env.MONGO_URI || "",
    db_name: process.env.DB_NAME || "",
    port: process.env.PORT || "",
};

// Validate if any child property is null or undefined
for (const prop in conf) {
    if (conf.hasOwnProperty(prop) && (conf as any)[prop] == "") {
        throw new Error(`Missing configuration: ${prop}`);
        // console.error(`Missing configuration: ${prop}`);
    }
}

export default conf