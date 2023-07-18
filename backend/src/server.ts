import app from './app';
import { createServer } from 'http'
import Controller from './controllers/mongodb';
import { setupSocketIO } from './controllers/socket';
import conf from './config';
const port = conf.port || 443
const dbOpts = {}
const DbController = new Controller(conf.mongo_uri, conf.db_name, dbOpts);
DbController
    .init()
    .then(() => {
        // Only start server after db is initialized
        const server = createServer(app);
        setupSocketIO(server);

        server.listen(port);
    })
    .catch(
        err => console.error(err)
    );
export { DbController };
