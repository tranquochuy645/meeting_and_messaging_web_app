import Router from 'express';
import authRouter from './auth';
import roomsRouter from './rooms';
import usersRouter from './users';
const router = Router();

router.use('/auth', authRouter);
router.use('/rooms', roomsRouter);
router.use('/users', usersRouter);

export default router;
