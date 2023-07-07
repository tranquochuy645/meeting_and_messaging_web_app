import { Router } from 'express';
import { verifyToken } from '../middleware/jwt';
import { getDocuments } from '../controllers/mongodb';
import { ObjectId } from 'mongodb';
const router = Router();
interface User {
  _id: string;
  username: string;
  fullname: string;
  avatar: string;
  friends: string[];
  conversations: string[];
  createdAt: string;
}
// GET /api/users
router.get('/', verifyToken, (req, res) => {
  const oid = new ObjectId(req.headers.userId as string);
  getDocuments(
    'users',
    { "_id": oid },
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

// POST /api/users
router.post('/', (req, res) => {
  // Create a new user logic here
});

// PUT /api/users/:id
router.put('/:id', (req, res) => {
  // Update user by ID logic here
});

// DELETE /api/users/:id
router.delete('/:id', (req, res) => {
  // Delete user by ID logic here
});

// Other user-related routes...

export default router;
