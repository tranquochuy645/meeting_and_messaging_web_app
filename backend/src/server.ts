import app from './app';
import { createServer } from 'http'
import { connectToDb } from './controllers/mongodb';
import { setupSocketIO } from './controllers/socket';
import conf from './config';

const dbOpts = {}
const mongo_uri = conf.mongo_uri
const db_name = conf.db_name
const port = conf.port || 443

connectToDb(
    mongo_uri,
    db_name,
    dbOpts,
    (err) => {
        if (err) throw err
        // Only start server after db is connected
        const server = createServer(app);
        setupSocketIO(server)
        server.listen(port);     
    }
)


