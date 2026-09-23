import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import validate from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { LoginSchema, RegisterSchema } from './auth.schemas';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.me);

export default router;
