import app from './app';
import {createServer} from 'http'
import {config} from 'dotenv'
config();

const port = process.env.PORT;
const server = createServer(app);
server.listen(port);

