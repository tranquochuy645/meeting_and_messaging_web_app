import express from 'express'
import api from './api'
const app=express();
app.use(express.static('public'));
app.use('/api',api);
export default app;

