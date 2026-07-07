import { Router } from 'express';
import { handleAuth, getStats } from '../controllers/auth.controller';

const router = Router();

// Routes mounted on `/api/users`
router.post('/', handleAuth);
router.get('/:username', getStats);

export default router;
