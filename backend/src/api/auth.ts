import { Router } from 'express';
import { getDocuments, insertDocument } from '../controllers/mongodb';
import { generateAuthToken } from '../middleware/jwt';
import { handleRegPassword } from '../middleware/hanldeRegPassword';
import { generateProfileImage } from '../lib/generateProfileImage';
import bcrypt from 'bcrypt';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  handleRegPassword,
  (req, res) => {
    if (Object.keys(req.body).length === 0) {

      res.status(400).json({ message: 'Bad Request' });
      return;
    }
    const { username, password } = req.body;

    // Check if the username already exists in the database
    getDocuments('users', { username })
      .then(
        (users) => {
          if (users.length === 0) {
            // Username is available, register the new user
            const newDefaultProfileImage = generateProfileImage(username.charAt(0));
            const newUser = {
              username,
              password,
              fullname: username,
              avatar: newDefaultProfileImage,
              rooms: [globalThis.globalChatId],
              createdAt: new Date
            };
            insertDocument('users', newUser)
              .then(() => {
                // User registered successfully
                res.status(200).json({ message: 'Created account successfully' });
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
router.post(
  '/login',
  (req, res) => {
    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ message: 'Bad Request' });
      return;

    }
    const { username, password } = req.body;

    // Find user in the database based on the provided username and password
    getDocuments(
      'users',
      { username },
      {
        projection: {
          fullname: 1,
          password: 1
        }
      }
    )
      .then(
        (users) => {
          if (users.length !== 1 || !users[0].password) {
            // User not found or multiple users found or null password
            res.status(401).json({ message: 'Invalid credentials' });
          } else {
            // User found, validate password 
            const user = users[0];
            bcrypt.compare(
              password,
              users[0].password,
              (err, result) => {
                if (err) {
                  return res.status(500).json(
                    { message: "Internal Server Error" }
                  );
                }
                if (result) {
                  // Correct password
                  // Generate and send authentication token
                  const authToken = generateAuthToken(
                    {
                      _id: user._id,
                      fullname: user.fullname,
                      password: user.password
                    }
                  );
                  return res.status(200).json(
                    {
                      authToken,
                    }
                  );
                }
                // Wrong password
                return res.status(401).json({ message: 'Invalid credentials' });

              }

            );
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
