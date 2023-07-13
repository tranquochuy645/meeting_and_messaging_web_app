import { Router } from 'express';
import { getDocuments } from '../controllers/mongodb';

const router = Router();

router.get('/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const result = await getDocuments('users', { fullname: new RegExp(query, "i") }, { projection: { _id: 1, fullname: 1, avatar: 1 } });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
