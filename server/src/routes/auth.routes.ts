import { Router } from 'express';
import { handleAuth, handleLogin, getStats, getMe, handleRefreshToken } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validateRegisterInput, validateLoginInput } from '../middleware/validation.middleware';

const router = Router();

// Routes mounted on `/api/users`
router.post('/', authLimiter, validateRegisterInput, handleAuth);
router.post('/login', authLimiter, validateLoginInput, handleLogin);
router.post('/refresh-token', authLimiter, handleRefreshToken);
router.get('/me', protect, getMe);
router.get('/:username', getStats);

export default router;
