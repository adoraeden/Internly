import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../controllers/applicationController.js';

const router = Router();

router.use(protect); // every route below requires a logged-in user

router.get('/', listApplications);
router.post('/', createApplication);
router.get('/:id', getApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

export default router;