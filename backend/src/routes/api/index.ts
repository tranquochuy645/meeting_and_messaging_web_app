import { Router } from 'express';

// Import the version 1 (v1) router that contains all version 1 routes.
import apiV1 from './v1';

const router = Router();

// Mount the version 1 (v1) router under the path '/v1'.
router.use('/v1', apiV1);

// If none of the routes matched, respond with a 418 "I'm a teapot" status code and a custom message.
router.all('*', (req, res) => {
    res.status(418).json({ message: "I'm not gonna deal with this" });
});

export default router;
