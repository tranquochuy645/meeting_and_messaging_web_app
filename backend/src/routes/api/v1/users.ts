import { Router } from 'express';
import { verifyToken } from '../../../middlewares/express/jwt';
import { chatAppDbController as dc } from '../../../controllers/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { handleUpdatePassword } from '../../../middlewares/express/handleUpdatePassword';
const router = Router();

/**
 * Route to get the user's own profile information.
 * @route GET /api/v1/users
 * @middleware verifyToken - Middleware to verify the user's access token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} - A Promise that resolves to the user's profile information.
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const data = await dc.users.readProfile(req.headers.userId as string);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Route to retrieve a user's invitations.
 * @route GET /invitations
 * @middleware verifyToken - Middleware to verify the user's token.
 */
router.get('/invitations', verifyToken, async (req, res) => {
  try {
    // Extract user invitations using the data controller
    const data = await dc.users.extractInvitationsList(req.headers.userId as string);

    // Respond with the extracted invitations
    res.status(200).json(data);
  } catch (err: any) {
    // Handle errors and respond with an error message
    res.status(500).json({ message: err.message });
  }
});

/**
 * Route to get the short profile information of a specific user.
 * @route GET /api/v1/users/:id
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} - A Promise that resolves to the short profile information of the requested user.
 */
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id as string)) {
      return res.status(400).json({ message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer" });
    }
    const data = await dc.users.readShortProfile(req.params.id as string);
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * Interface for user update options.
 */
interface UserUpdateOptions {
  [key: string]: string | undefined;
  password?: string;
  fullname?: string;
  avatar?: string;
}

/**
 * Route to update user profile information.
 * @route PUT /api/v1/users/
 * @middleware verifyToken - Middleware to verify the user's access token.
 * @middleware handleUpdatePassword - Middleware for handling password updates securely.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} - A Promise that resolves to a response object with a success message or an error message.
 */
router.put('/', verifyToken, handleUpdatePassword, async (req, res) => {
  try {
    // Extract the update data from req.body
    const updateData: UserUpdateOptions = req.body;
    if (updateData.password) {
      if (!updateData.current_password) {
        return res.status(400).json({ message: 'Missing current password' });
      }
      const user = await dc.users.getPassword(undefined, req.headers.userId as string)
      const compResult = await bcrypt.compare(updateData.current_password, user.password);
      if (!compResult) {
        return res.status(403).json({ message: "Password mismatch" });
      }
    }
    const result = await dc.users.updateUser(req.headers.userId as string, updateData)
    if (result) {
      return res.status(200).json({ message: 'User updated successfully' });
    }
    res.status(400).json({ message: 'Invalid update fields || no field changed' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Route to delete a user account.
 * @route DELETE /api/v1/users/:id
 * @middleware verifyToken - Middleware to verify the user's access token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} - A Promise that resolves to a response object with a success message or an error message.
 */
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = req.headers.userId as string;
    const password = req.body.password as string;
    if (!password) {
      return res.status(401).json({ message: 'Missing password' });
    }
    const user = await dc.users.getPassword(undefined, userId);

    if (!user) {
      return res.status(404).json({ message: 'User Not Found' });
    }

    if (!user.password) {
      throw new Error("password doesn't exist in the database");
    }

    const compResult = await bcrypt.compare(password, user.password);
    if (!compResult) {
      return res.status(403).json({ message: "Password mismatch" });
    }
    await dc.rooms.removeUserFromAllRooms(userId);

    // Attempt to delete the user by ID
    const deletedCount = await dc.users.deleteUser(userId);

    // Check if a user was deleted (deletedCount > 0)
    if (deletedCount) {
      return res.status(200).json({ message: 'User deleted successfully' });
    }

    // No user found with the provided ID
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Other user-related routes...

export default router;
