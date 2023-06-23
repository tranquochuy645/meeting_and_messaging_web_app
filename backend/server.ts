import {config} from 'dotenv'
import express from 'express'
import {createServer} from 'http'
config();

const port = process.env.PORT;
const app=express();
app.use(express.static('public'));
const server = createServer(app);
server.listen(port);

