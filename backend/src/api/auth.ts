import { Router } from 'express';
import { getDocuments, insertDocument } from '../controllers/mongodb';
import { generateAuthToken } from '../lib/generateAuthToken';
import { generateProfileImage } from '../lib/generateProfileImage';
import { handleRegPassword } from '../middleware/express/handleRegPassword';
import { updateGlobalRoomInvitedList } from '../lib/updateGlobalRoomInvitedList';
import bcrypt from 'bcrypt';
const router = Router();

// POST /api/auth/register
router.post('/register', handleRegPassword, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Bad Request' });
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Credentials Missing' });
    }

    const users = await getDocuments('users', { username });
    if (users.length === 0) {
      const newDefaultProfileImage = generateProfileImage(username.charAt(0));
      const newUser = {
        username,
        password,
        fullname: username,
        avatar: newDefaultProfileImage,
        isOnline: false,
        invitations: [globalThis.globalChatId],
        rooms: [],
        createdAt: new Date(),
      };

      const result = await insertDocument('users', newUser);
      await updateGlobalRoomInvitedList(result.insertedId);
      return res.status(200).json({ message: 'Created account successfully' });
    }
    return res.status(409).json({ message: 'Username already exists' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Bad Request' });
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Credentials Missing' });
    }

    const users = await getDocuments('users', { username }, { projection: { password: 1 } });

    if (users.length !== 1) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    const user = users[0];
    if (!user.password) {
      throw new Error("password or fullname doesn't exist in the database");
    }

    const result = await bcrypt.compare(password, user.password);

    if (result) {
      const access_token = generateAuthToken({ _id: user._id, role: 'owner' });
      return res.status(200).json({ access_token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Logout logic here
});

// Other authentication-related routes...

export default router;
