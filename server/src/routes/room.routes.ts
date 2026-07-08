import { Router } from 'express';
import {
  createRoomController,
  joinRoomController,
  leaveRoomController,
  getRoomsController,
  getRoomDetailsController,
} from '../controllers/room.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All room routes are protected
router.post('/create', protect, createRoomController);
router.post('/join', protect, joinRoomController);
router.post('/leave', protect, leaveRoomController);
router.get('/', protect, getRoomsController);
router.get('/:roomId', protect, getRoomDetailsController);

export default router;
