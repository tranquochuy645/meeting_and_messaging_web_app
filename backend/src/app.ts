import express from 'express';
import api from './api';
import { chooseFavicon } from './middleware/faviconPick';
import { filterJsonError } from './middleware/jsonFilter';

const app = express();



// Use the chooseFavicon middleware to dynamically set the favicon based on the device
app.use(chooseFavicon);

app.use('/api',
    express.json(),
    filterJsonError,
    api
);

// app.use('/api', api);

app.get('/', express.static('public'));


export default app;
