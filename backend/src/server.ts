import app from './app';
import { createServer } from 'http'
import { chatAppDbController as dc } from './controllers/mongodb'
import { ioController as ic } from './controllers/socket';
import conf from './config';
const port = conf.port || 443
const dbOpts = {}
const RUN = async () => {
    await dc.init(conf.mongo_uri, conf.db_name, dbOpts);
    // Only start server after db is initialized
    const server = createServer(app);
    ic.init(server, dc)
    server.listen(port);
}
RUN();

