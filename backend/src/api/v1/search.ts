import { Router } from 'express';
import { verifyToken } from '../../middlewares/express/jwt';
import {DbController as CTR} from '../../server';
const router = Router();

router.get('/:query', verifyToken, async (req, res) => {
    try {
        const query = req.params.query;
        const result = await CTR.users.search(req.headers.userId as string,query,5)
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
