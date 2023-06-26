import express, { NextFunction, RequestHandler } from 'express';
import api from './api';
import favicon from 'express-favicon';
import path from 'path';

const app = express();

// Define the function to choose the appropriate favicon based on the device
const chooseFavicon:RequestHandler = (req, res, next) => {
  const userAgent = req?.headers['user-agent'];

  // Check the user-agent to determine the device and set the corresponding favicon path
  let faviconPath = '';
  if (userAgent?.includes('Android')) {
    faviconPath = 'android-chrome-192x192.png';
  } else if (userAgent?.includes('iPhone')) {
    faviconPath = 'apple-touch-icon.png';
  } else {
    faviconPath = 'favicon.ico';
  }

  // Set the favicon middleware using the determined favicon path
  const faviconFilePath = path.join(__dirname, '..', 'public', 'favicon_io', faviconPath);
  favicon(faviconFilePath)(req, res, next);
};

// Use the chooseFavicon middleware to dynamically set the favicon based on the device
app.use(chooseFavicon);

app.use(express.static('public'));
app.use('/api', express.json(), api);

export default app;
