import express from 'express';
import path from 'path';
import api from './api';
import { chooseFavicon } from './middleware/express/faviconPick';
import { filterJsonError } from './middleware/express/jsonFilter';

const app = express();
const publicPath = path.resolve(__dirname, '../public');
const indexPath = path.join(publicPath, 'index.html');

app.use(express.static(publicPath));
app.use(chooseFavicon);

app.use('/api', express.json(), filterJsonError, api);

app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

export default app;
