// Import the Express app instance from app.ts
import app from './app';
import { createServer } from 'http';
import { chatAppDbController as dc } from './controllers/mongodb';
import { ioController as ic } from './controllers/socket';
import { s3Init } from './controllers/aws/s3';
import conf from './config';

// Set the default port to 443 or the value specified in the config file
const port = conf.port || 443;

// Database options (if needed)
const dbOpts = {};

// Function to initialize the application
const RUN = async () => {
    await s3Init();

    // Initialize the MongoDB database with the specified URI and database name
    await dc.init(conf.mongo_uri, conf.db_name, dbOpts);

    // Only start the server after the database is initialized
    const server = createServer(app);

    // Initialize the socket.io controller with the HTTP server and the database controller
    ic.init(server, dc);

    // Start listening on the specified port for incoming requests
    server.listen(port);
};

// Call the RUN function to start the application
RUN();
