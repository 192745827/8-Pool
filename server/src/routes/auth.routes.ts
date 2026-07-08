import { Router } from 'express';
import { handleAuth, handleLogin, getStats, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Routes mounted on `/api/users`
router.post('/', handleAuth);
router.post('/login', handleLogin);
router.get('/me', protect, getMe);
router.get('/:username', getStats);

export default router;
