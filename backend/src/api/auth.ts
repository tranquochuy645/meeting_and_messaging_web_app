import {Router} from 'express';
import { getDocuments,insertDocument} from '../controllers/mongodb';
import { generateAuthToken } from '../middleware/jwt';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username already exists in the database
    getDocuments('users', { username })
      .then((users) => {
        if (users.length === 0) {
          // Username is available, register the new user
          const newUser = { username, password };
          insertDocument('users', newUser)
            .then(() => {
              // User registered successfully, generate and send authentication token
              const authToken = generateAuthToken(newUser); // Function to generate authentication token
              res.status(201).json({ authToken });
            })
            .catch((error) => {
              console.error('Error registering user:', error);
              res.status(500).json({ message: 'Internal server error' });
            });
        } else {
          // Username already exists
          res.status(409).json({ message: 'Username already exists' });
        }
      })
      .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
      });
  });

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Find user in the database based on the provided username and password
    getDocuments('users', { username, password })
      .then((users) => {
        if (users.length === 1) {
          // User found, generate and send authentication token
          const user = users[0];
          const authToken = generateAuthToken(user); // Function to generate authentication token
  
          res.status(200).json({ authToken });
        } else {
          // User not found or multiple users found
          res.status(401).json({ message: 'Invalid credentials' });
        }
      })
      .catch((error) => {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
      });
  });

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Logout logic here
});

// Other authentication-related routes...

export default router;
