import { Router } from 'express';
import { getDocuments, insertDocument } from '../controllers/mongodb';
import { generateAuthToken } from '../middleware/jwt';
import { generateProfileImage } from '../lib/generateProfileImage';
import { hashPassword } from '../middleware/hashPassword';
import bcrypt from 'bcrypt';
const router = Router();

// POST /api/auth/register
router.post('/register', hashPassword, (req, res) => {


  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Bad Request' });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Credentials Missing' });
  }
  return getDocuments('users', { username })
    .then((users) => {
      if (users.length === 0) {
        const newDefaultProfileImage = generateProfileImage(username.charAt(0));
        const newUser = {
          username,
          password,
          fullname: username,
          avatar: newDefaultProfileImage,
          rooms: [globalThis.globalChatId],
          createdAt: new Date()
        };

        return insertDocument('users', newUser)
          .then(() => {
            return res.status(200).json({ message: 'Created account successfully' });
          })
          .catch((error) => {
            throw error;
          });
      }
      return res.status(409).json({ message: 'Username already exists' });
    })
    .catch((error) => {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    });
});


// POST /api/auth/login
router.post('/login', (req, res) => {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Bad Request' });
  }
  //username and password inputed
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Credentials Missing' });
  }
  // Find user in the database based on the provided username
  return getDocuments('users', { username }, { projection: { fullname: 1, password: 1 } })
    .then(
      (users) => {
        if (users.length !== 1) {
          // User not found
          return res.status(404).json({ message: 'User Not Found' });
        }
        // User found, validate password 
        const user = users[0];
        if (!user.password || !user.fullname) {
          //Something is wrong with in the database
          throw new Error("password or fullname doesn't exist in the database");
        }
        return bcrypt.compare(password, user.password,
          (err, result) => {
            if (err) {
              throw err
            }
            if (result) {
              // Correct password
              // Generate and send authentication token
              const authToken = generateAuthToken(
                {
                  _id: user._id,
                  fullname: user.fullname
                }
              );
              return res.status(200).json({ authToken });
            }
            // Wrong password
            return res.status(401).json({ message: 'Invalid credentials' });
          }
        )
      }
    )
    .catch((error) => {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    );
}
);

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Logout logic here
});

// Other authentication-related routes...

export default router;
