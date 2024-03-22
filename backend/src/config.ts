import { config } from 'dotenv';
config();

// Define an interface to represent the properties of the configuration object.
interface EnvProps {
    jwt_key: string;
    mongo_uri: string;
    db_name: string;
    port: string;
    media_bucket: string;
    aws_region: string;
}

// Create a configuration object using environment variables.
const conf: EnvProps = {
    jwt_key: process.env.JWT_KEY || "",
    mongo_uri: process.env.MONGO_URI || "",
    db_name: process.env.DB_NAME || "",
    port: process.env.PORT || "",
    media_bucket: process.env.MEDIA_BUCKET || "",
    aws_region: process.env.AWS_REGION || "",
};

// Validate if any child property is null or undefined
// Loop through each property in the configuration object
for (const prop in conf) {
    // Check if the property exists in the object and its value is an empty string
    if (conf.hasOwnProperty(prop) && (conf as any)[prop] == "") {
        // If a property is missing or has an empty value, throw an error indicating the missing configuration
        // This will crash the app right away if any configuration is missing
        throw new Error(`Missing configuration: ${prop}`);
    }
}

// Export the configuration object.
export default conf;
