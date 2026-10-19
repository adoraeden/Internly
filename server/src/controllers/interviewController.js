import mongoose from 'mongoose';
import { z } from 'zod';
import UserQuestion from '../models/UserQuestion.js';
import PrepState from '../models/PrepState.js';
import { parseBody } from '../utils/validate.js';

const ID_RX = /^[A-Za-z0-9_-]{1,80}$/;
const MAX_CUSTOM = 200;
const MAX_TRACKED = 1000;
const DEFAULT_TIP = 'Structure your response logically with concrete project examples.';

const badId = res => res.status(400).json({ message: 'Invalid id.' });
const notFound = res => res.status(404).json({ message: 'Question not found.' });

// ---------- Validation rules ----------
const progressSchema = z
  .object({
    status: z.enum(['Not Started', 'Practicing', 'Completed']),
    saved: z.boolean(),
    notes: z.string().max(5000, 'Notes are too long.'),
    userPracticeAnswer: z.string().max(10000, 'Your answer is too long.'),
    confidenceRating: z.number().int().min(1).max(5),
  })
  .partial();

const base = {
  question: z.string().trim().min(1, 'Question is required.').max(300, 'Question is too long.'),
  category: z.enum(['Technical', 'HR & Behavioral', 'Role-Specific']),
  topic: z.string().trim().min(1, 'Topic is required.').max(100, 'Topic is too long.'),
  subCategory: z.string().trim().max(100, 'Subcategory is too long.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  assessing: z.string().trim().max(500, 'This is too long.'),
  conceptRefresher: z.string().max(5000, 'This is too long.'),
  exampleAnswer: z.string().max(5000, 'This is too long.'),
  preparationTips: z.array(z.string().trim().min(1).max(300)).max(20),
};

const createCustomSchema = z.object({
  question: base.question,
  category: base.category,
  topic: base.topic,
  difficulty: base.difficulty,
  subCategory: base.subCategory.optional(),
  assessing: base.assessing.optional(),
  conceptRefresher: base.conceptRefresher.optional(),
  exampleAnswer: base.exampleAnswer.optional(),
  preparationTips: base.preparationTips.optional(),
});

const updateCustomSchema = z.object(base).partial();

const resourceSchema = z
  .object({ bookmarked: z.boolean(), completed: z.boolean() })
  .partial();

const studyDaySchema = z.object({ completed: z.boolean() });

const sessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date format YYYY-MM-DD.'),
  questionIds: z.array(z.string().regex(ID_RX)).max(50),
  completedCount: z.number().int().min(0).max(50),
  averageConfidence: z.number().min(0).max(5),
  durationMinutes: z.number().int().min(0).max(600),
});

// ---------- Helpers ----------
function formatSession(s) {
  return {
    id: String(s._id),
    date: s.date,
    questionIds: s.questionIds,
    completedCount: s.completedCount,
    averageConfidence: s.averageConfidence,
    durationMinutes: s.durationMinutes,
  };
}

// Creates this user's prep-state record if needed, then applies the update
function updatePrep(owner, update) {
  return PrepState.findOneAndUpdate({ owner }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: false,
  }).lean();
}

// ---------- Handlers ----------

// Everything the interview page needs, in one request
export async function getInterviewState(req, res) {
  const owner = req.user._id;
  const [questions, prep] = await Promise.all([
    UserQuestion.find({ owner }).sort({ createdAt: -1 }),
    PrepState.findOne({ owner }).lean(),
  ]);

  res.json({
    questions,
    resources: prep?.resources || {},
    studyDays: prep?.studyDays || {},
    sessions: (prep?.sessions || []).map(formatSession),
  });
}

// Progress on any question: status, bookmark, notes, practice answer, confidence
export async function updateQuestionProgress(req, res) {
  const { questionId } = req.params;
  if (!ID_RX.test(questionId)) return badId(res);

  const { data, errors, message } = parseBody(progressSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }

  const owner = req.user._id;
  const isCustomId = questionId.startsWith('custom-');

  // Custom questions must already exist. Only library ids may be created here.
  if (!isCustomId) {
    const exists = await UserQuestion.exists({ owner, questionId });
    if (!exists) {
      const tracked = await UserQuestion.countDocuments({ owner });
      if (tracked >= MAX_TRACKED) {
        return res.status(400).json({ message: 'You have reached the tracking limit.' });
      }
    }
  }

  const saved = await UserQuestion.findOneAndUpdate(
    { owner, questionId },
    { $set: data },
    { upsert: !isCustomId, new: true, runValidators: true }
  );

  if (!saved) return notFound(res);
  res.json({ question: saved });
}

export async function createCustomQuestion(req, res) {
  const { data, errors, message } = parseBody(createCustomSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const owner = req.user._id;
  const customCount = await UserQuestion.countDocuments({ owner, isCustom: true });
  if (customCount >= MAX_CUSTOM) {
    return res
      .status(400)
      .json({ message: `You can add up to ${MAX_CUSTOM} custom questions.` });
  }

  const created = await UserQuestion.create({
    owner,
    questionId: `custom-${new mongoose.Types.ObjectId().toString()}`,
    isCustom: true,
    question: data.question,
    category: data.category,
    learningPath: data.category,
    topic: data.topic,
    subCategory: data.subCategory || '',
    difficulty: data.difficulty,
    assessing:
      data.assessing || 'Evaluates understanding of engineering fundamentals and problem solving.',
    conceptRefresher:
      data.conceptRefresher || 'Core concept review and application fundamentals.',
    exampleAnswer: data.exampleAnswer || 'Example structured answer explaining your reasoning.',
    preparationTips: data.preparationTips?.length ? data.preparationTips : [DEFAULT_TIP],
  });

  res.status(201).json({ question: created });
}

export async function updateCustomQuestion(req, res) {
  const { questionId } = req.params;
  if (!ID_RX.test(questionId)) return badId(res);

  const { data, errors, message } = parseBody(updateCustomSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const doc = await UserQuestion.findOne({
    owner: req.user._id,
    questionId,
    isCustom: true,
  });
  if (!doc) return notFound(res);

  doc.set(data);
  if (data.category) doc.learningPath = data.category;
  if (data.preparationTips && data.preparationTips.length === 0) {
    doc.preparationTips = [DEFAULT_TIP];
  }

  await doc.save();
  res.json({ question: doc });
}

export async function deleteCustomQuestion(req, res) {
  const { questionId } = req.params;
  if (!ID_RX.test(questionId)) return badId(res);

  const deleted = await UserQuestion.findOneAndDelete({
    owner: req.user._id,
    questionId,
    isCustom: true,
  });
  if (!deleted) return notFound(res);

  res.json({ message: 'Question deleted.' });
}

export async function updateResource(req, res) {
  const { resourceId } = req.params;
  if (!ID_RX.test(resourceId)) return badId(res);

  const { data, errors, message } = parseBody(resourceSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: 'Nothing to update.' });
  }

  const set = {};
  for (const [key, value] of Object.entries(data)) {
    set[`resources.${resourceId}.${key}`] = value;
  }

  const prep = await updatePrep(req.user._id, { $set: set });
  res.json({ resource: prep.resources?.[resourceId] || {} });
}

export async function updateStudyDay(req, res) {
  const day = Number(req.params.day);
  if (!Number.isInteger(day) || day < 1 || day > 30) return badId(res);

  const { data, errors, message } = parseBody(studyDaySchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const prep = await updatePrep(req.user._id, {
    $set: { [`studyDays.${day}`]: data.completed },
  });
  res.json({ day, completed: Boolean(prep.studyDays?.[day]) });
}

export async function createSession(req, res) {
  const { data, errors, message } = parseBody(sessionSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  // Newest first, and keep only the latest 100
  const prep = await updatePrep(req.user._id, {
    $push: { sessions: { $each: [data], $position: 0, $slice: 100 } },
  });

  res.status(201).json({ session: formatSession(prep.sessions[0]) });
}