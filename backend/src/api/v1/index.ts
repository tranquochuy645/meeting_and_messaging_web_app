import { Router } from 'express';
import RateLimit from 'express-rate-limit';

import authRouter from './auth';
import roomsRouter from './rooms';
import usersRouter from './users';
import searchRouter from './search';


const router = Router();

// Create a rate limiter middleware for general routes
const generalLimiter = RateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // maximum number of requests allowed in the window
    message: 'Too many requests from this IP, please try again later.',
});

// Create a rate limiter middleware specifically for the /auth route
const authLimiter = RateLimit({
    windowMs: 60 * 5000, // 1 minute
    max: 30, // maximum number of requests allowed in the window for /auth route
    message: 'Too many requests for authentication from this IP, please try again later.',
});


router.use('/auth', authLimiter, authRouter);
router.use('/rooms', generalLimiter, roomsRouter);
router.use('/users', generalLimiter, usersRouter);
router.use('/search', generalLimiter, searchRouter);

export default router;
