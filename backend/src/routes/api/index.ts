import { Router } from 'express';

import apiV1 from './v1'

const router = Router();
// /api/v1
router.use('/v1', apiV1);
router.get('*', (req, res) => {
    res.status(418).json({ message: "I'm not gonna deal with this" })
})

export default router;
