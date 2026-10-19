import mongoose from 'mongoose';
import { z } from 'zod';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import { parseBody } from '../utils/validate.js';

const MAX_SAVED = 50;

const str = max => z.string().max(max);

// Shape of the report your resume matcher produces. Unknown fields are dropped.
const resultSchema = z.object({
  matchPercentage: z.number().min(0).max(100),
  matchedKeywords: z
    .array(z.object({ term: str(80), count: z.number().int().min(0), category: str(60) }))
    .max(300),
  missingKeywords: z
    .array(z.object({ term: str(80), category: str(60), importance: str(20) }))
    .max(300),
  otherSkills: z.array(str(80)).max(300),
  totalJobKeywords: z.number().int().min(0),
  totalResumeKeywords: z.number().int().min(0),
  sectionReviews: z
    .array(z.object({ section: str(80), detected: z.boolean(), feedback: str(600) }))
    .max(30),
  actionableSuggestions: z.array(str(800)).max(40),
  beforeAfterExamples: z
    .array(z.object({ original: str(600), revised: str(600), explanation: str(800) }))
    .max(20),
  checklist: z
    .array(
      z.object({
        id: str(80),
        text: str(500),
        category: str(60),
        completed: z.boolean(),
      })
    )
    .max(60),
  wordCounts: z.object({
    jobDescription: z.number().int().min(0),
    resume: z.number().int().min(0),
  }),
  disclaimer: str(1000),
});

const createSchema = z.object({
  name: z.string().trim().max(100, 'The title is too long.').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date format YYYY-MM-DD.'),
  jobCompany: z.string().trim().max(100).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  result: resultSchema,
});

const notFound = res => res.status(404).json({ message: 'Saved analysis not found.' });

// Summaries only: no full report, so the history list stays light
export async function listAnalyses(req, res) {
  const analyses = await ResumeAnalysis.find({ owner: req.user._id })
    .select('-result')
    .sort({ createdAt: -1 });
  res.json({ analyses });
}

export async function getAnalysis(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return notFound(res);

  const analysis = await ResumeAnalysis.findOne({ _id: id, owner: req.user._id });
  if (!analysis) return notFound(res);
  res.json({ analysis });
}

export async function createAnalysis(req, res) {
  const { data, errors, message } = parseBody(createSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const owner = req.user._id;
  const count = await ResumeAnalysis.countDocuments({ owner });
  if (count >= MAX_SAVED) {
    return res.status(400).json({
      message: `You can keep up to ${MAX_SAVED} saved analyses. Delete an old one first.`,
    });
  }

  const created = await ResumeAnalysis.create({
    owner,
    name: data.name || `Analysis — ${data.date}`,
    date: data.date,
    jobCompany: data.jobCompany || undefined,
    jobTitle: data.jobTitle || undefined,
    // The server works out the numbers itself, so they can't disagree with the report
    matchPercentage: data.result.matchPercentage,
    matchedCount: data.result.matchedKeywords.length,
    missingCount: data.result.missingKeywords.length,
    result: data.result,
  });

  res.status(201).json({ analysis: created });
}

export async function deleteAnalysis(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return notFound(res);

  const deleted = await ResumeAnalysis.findOneAndDelete({ _id: id, owner: req.user._id });
  if (!deleted) return notFound(res);

  res.json({ message: 'Saved analysis deleted.' });
}