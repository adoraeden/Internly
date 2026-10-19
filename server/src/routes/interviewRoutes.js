import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getInterviewState,
  updateQuestionProgress,
  createCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  updateResource,
  updateStudyDay,
  createSession,
} from '../controllers/interviewController.js';

const router = Router();

router.use(protect); // every route below requires a logged-in user

router.get('/', getInterviewState);

router.put('/questions/:questionId', updateQuestionProgress);

router.post('/custom', createCustomQuestion);
router.put('/custom/:questionId', updateCustomQuestion);
router.delete('/custom/:questionId', deleteCustomQuestion);

router.put('/resources/:resourceId', updateResource);
router.put('/study-days/:day', updateStudyDay);
router.post('/sessions', createSession);

export default router;