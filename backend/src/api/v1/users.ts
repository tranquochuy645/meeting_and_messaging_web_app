import { Router } from 'express';
import { verifyToken } from '../../middleware/express/jwt';
import { users as usersCRUD } from '../../controllers/mongodb';
import { ObjectId } from 'mongodb';
const router = Router();

// GET /api/v1/users
router.get('/', verifyToken, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.headers.userId as string)) {
      return res.status(400)
        .json(
          { message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer" }
        )
    }
    const data = await usersCRUD.readProfile(req.headers.userId as string)
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message })
  }
});

// GET /api/v1/users/:id
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id as string)) {
      return res.status(400)
        .json(
          { message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer" }
        )
    }
    const data = await usersCRUD.readShortProfile(req.params.id as string)
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

interface UserUpdateOptions {
  [key: string]: string | undefined;
  password?: string;
  fullname?: string;
  avatar?: string;
}

// PUT /api/v1/users/
router.put('/', verifyToken, async (req, res) => {
  try {
    // Extract the update data from req.body
    const updateData: UserUpdateOptions = req.body;
    // console.log(req.body);
    const allowedFields: string[] = ['password', 'fullname', 'avatar'];
    const updateFields = Object.keys(updateData);
    const invalidFields = updateFields.filter(
      //only accept valid field and string data type
      (field) => !allowedFields.includes(field) || typeof updateData[field] !== 'string'
    );
    if (updateFields.length == 0 || invalidFields.length > 0) {
      return res.status(400).json({ message: 'Invalid update fields', invalidFields });
    }

    // Update the user document by ID with the specified fields
    const result = await usersCRUD.updateUser(req.headers.userId as string, updateData)
    if (!result) {
      return res.status(200).json({ message: 'User updated successfully' });
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// DELETE /api/v1/users/:id
router.delete('/:id', (req, res) => {
  // Delete user by ID logic here
});

// Other user-related routes...

export default router;
