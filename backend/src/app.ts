// Import required modules
import express from 'express';
import path from 'path';
import api from './routes/api';
import media from './routes/media';
import { filterJsonError } from './middlewares/express/jsonFilter';

// Create an Express app instance
const app = express();

// Define the path to the public directory
const publicPath = path.resolve(__dirname, '../public');

// Define the path to the index.html file inside the public directory
const indexPath = path.join(publicPath, 'index.html');

// Serve static files from the public directory
app.use(express.static(publicPath));

// Mount the 'media' route for serving media files
app.use('/media', media);

// Mount the 'api' route with JSON parsing and error filtering middleware
app.use('/api', express.json(), filterJsonError, api);

// For all other routes (not matched by the above routes), serve the index.html file
// This is for integrating with react-router or handling client-side routing
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Export the Express app
export default app;
