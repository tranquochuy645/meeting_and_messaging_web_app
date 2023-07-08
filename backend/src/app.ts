import express from 'express';
import api from './api';
import { chooseFavicon } from './middleware/express/faviconPick';
import { filterJsonError } from './middleware/express/jsonFilter';

const app = express();
app.use(express.static('public'));

// Use the chooseFavicon middleware to dynamically set the favicon based on the device
app.use(chooseFavicon);

app.use('/api',
    express.json(),
    filterJsonError,
    api
);



export default app;
