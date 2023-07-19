import { Router } from 'express';
import { generateAuthToken } from '../../lib/generateAuthToken';
import { generateProfileImage } from '../../lib/generateProfileImage';
import { handleRegPassword } from '../../middlewares/express/handleRegPassword';
import {chatAppDbController as dc} from '../../controllers/mongodb';
import bcrypt from 'bcrypt';
const router = Router();

// POST /api/v1/auth/register
router.post('/register', handleRegPassword, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Bad Request' });
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Credentials Missing' });
    }
    const isAvailableUserName = await dc.users.checkAvailableUserName(username);
    if (isAvailableUserName) {
      const newDefaultProfileImage = generateProfileImage(username.charAt(0));
      const newUser = {
        username,
        password,
        fullname: username,
        avatar: newDefaultProfileImage,
        isOnline: false,
        invitations: [dc.globalChatId],
        rooms: [],
        createdAt: new Date(),
      };

      const result = await dc.users.createUser(newUser);
      if (!result) {
        throw new Error(`Error creating user`);
      }
      await dc.rooms.pushToInvitedList(result.insertedId.toString(), dc.globalChatId.toString());
      return res.status(200).json({ message: 'Created account successfully' });
    }
    return res.status(409).json({ message: 'Username already exists' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Bad Request' });
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Credentials Missing' });
    }

    const user = await dc.users.getPassword(username)

    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    if (!user.password) {
      throw new Error("password or fullname doesn't exist in the database");
    }

    const compResult = await bcrypt.compare(password, user.password);

    if (compResult) {
      const access_token = generateAuthToken({ _id: user._id, role: 'owner' });
      return res.status(200).json({ access_token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  // Logout logic here
});

// Other authentication-related routes...

export default router;
