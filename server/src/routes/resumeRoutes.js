import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  listAnalyses,
  getAnalysis,
  createAnalysis,
  deleteAnalysis,
} from '../controllers/resumeController.js';

const router = Router();

router.use(protect); // every route below requires a logged-in user

router.get('/', listAnalyses);
router.post('/', createAnalysis);
router.get('/:id', getAnalysis);
router.delete('/:id', deleteAnalysis);

export default router;