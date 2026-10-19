import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
} from '../controllers/profileController.js';

const router = Router();

router.use(protect); // every route below requires a logged-in user

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/avatar', updateAvatar);
router.delete('/avatar', removeAvatar);

export default router;