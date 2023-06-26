import express from 'express'
import api from './api'
const app = express();
app.use(express.static('public'));
app.use('/api', express.json(), api);
export default app;

