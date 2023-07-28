import { Router } from 'express';
import RateLimit from 'express-rate-limit';

// Import route handlers for different API endpoints
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
    windowMs: 60 * 5000, // 5 minutes
    max: 500, // maximum number of requests allowed in the window for /auth route
    message: 'Too many requests for authentication from this IP, please try again later.',
});

// Mount the authentication routes under the path '/auth' with rate limiting
router.use('/auth', authLimiter, authRouter);

// Mount the rooms routes under the path '/rooms' with general rate limiting
router.use('/rooms', generalLimiter, roomsRouter);

// Mount the users routes under the path '/users' with general rate limiting
router.use('/users', generalLimiter, usersRouter);

// Mount the search routes under the path '/search' with general rate limiting
router.use('/search', generalLimiter, searchRouter);

export default router;
