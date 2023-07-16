import { Router } from 'express';
import { verifyToken } from '../middleware/express/jwt';
import { getDocuments, updateDocument } from '../controllers/mongodb';
import { ObjectId } from 'mongodb';
const router = Router();

// GET /api/users
router.get('/', verifyToken, (req, res) => {
  const oid = new ObjectId(req.headers.userId as string);
  getDocuments(
    'users',
    { _id: oid },
    {
      projection:
      {
        password: 0
      }
    }
  )
    .then(
      (data) => {
        switch (data.length) {
          case 1:
            res.status(200).json(data[0]);
            break;
          case 0:
            res.status(404).json({ message: 'User not found' });
            break;
          default:
            res.status(500).json({ message: 'Internal Server Error' });
            break;
        }
      }
    )
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  let oid;
  try {
    oid = new ObjectId(req.params.id as string);
  } catch (err) {
    return res.status(400).json(
      { message: "ID passed in must be a string of 12 bytes or a string of 24 hex characters or an integer" }
    );
  }


  getDocuments(
    'users',
    { "_id": oid },
    {
      projection:
      {
        fullname: 1,
        avatar: 1,
        isOnline: 1,
        socketId: 1
      }
    }
  )
    .then(
      (data) => {
        switch (data.length) {
          case 1:
            res.status(200).json(data[0]);
            break;
          case 0:
            res.status(404).json({ message: 'User not found' });
            break;
          default:
            res.status(500).json({ message: 'Internal Server Error' });
            break;
        }
      }
    )
});

interface UserUpdateOptions {
  [key: string]: string | undefined;
  password?: string;
  fullname?: string;
  avatar?: string;
}

// PUT /api/users/
router.put('/', verifyToken, async (req, res) => {
  try {
    const oid = new ObjectId(req.headers.userId as string);
    // Extract the update data from req.body
    const updateData: UserUpdateOptions = req.body;
    console.log(req.body);
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
    const result = await updateDocument('users', { _id: oid }, { $set: updateData });
    if (result > 0) {
      return res.status(200).json({ message: 'User updated successfully' });
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  // Delete user by ID logic here
});

// Other user-related routes...

export default router;
