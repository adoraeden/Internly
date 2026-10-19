import mongoose from 'mongoose';
import { z } from 'zod';
import Application, {
  APPLICATION_STATUSES,
  APPLICATION_PRIORITIES,
  APPLICATION_WORK_MODES,
} from '../models/Application.js';
import { parseBody } from '../utils/validate.js';

// ---------- Validation rules (same rules as your form, enforced on the server) ----------
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the date format YYYY-MM-DD.');
const optionalDate = z.union([dateStr, z.literal('')]).optional();
const optionalUrl = z
  .string()
  .trim()
  .max(500, 'Link is too long.')
  .refine(v => v === '' || /^https?:\/\//i.test(v), 'Must start with http:// or https://')
  .optional();

const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company name is required').max(100, 'Company name is too long.'),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(100, 'Job title is too long.'),
  jobDescription: z.string().max(10000, 'Job description is too long.').optional(),
  applicationUrl: optionalUrl,
  companyWebsite: optionalUrl,
  location: z.string().trim().min(1, 'Location is required').max(100, 'Location is too long.'),
  workMode: z.enum(APPLICATION_WORK_MODES),
  applicationDate: dateStr,
  deadline: dateStr,
  followUpDate: optionalDate,
  followUpCompleted: z.boolean().optional(),
  interviewDate: optionalDate,
  status: z.enum(APPLICATION_STATUSES),
  priority: z.enum(APPLICATION_PRIORITIES).optional(),
  source: z
    .enum(['Company Website', 'LinkedIn', 'Job Board', 'Referral', 'University Portal', 'Other'])
    .optional(),
  salary: z.string().trim().max(100).optional(),
  currency: z.string().trim().max(10).optional(),
  notes: z.string().max(5000, 'Notes are too long.').optional(),
});

// Create needs the core fields. Update accepts any subset (edit form, status change, notes).
const createSchema = applicationSchema;
const updateSchema = applicationSchema.partial();

// ---------- Helpers ----------
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Finds one application that belongs to the logged-in user, or null
async function findOwned(req) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return null;
  return Application.findOne({ _id: id, owner: req.user._id });
}

const notFound = res => res.status(404).json({ message: 'Application not found.' });

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  deadline: { deadline: 1 },
  company: { company: 1 },
};

// ---------- Handlers ----------
export async function listApplications(req, res) {
  const { search, status, priority, workMode, sort } = req.query;

  const filter = { owner: req.user._id }; // always only my data

  // typeof checks stop people sneaking in database operators like {$ne: ...}
  if (typeof status === 'string' && APPLICATION_STATUSES.includes(status)) filter.status = status;
  if (typeof priority === 'string' && APPLICATION_PRIORITIES.includes(priority)) {
    filter.priority = priority;
  }
  if (typeof workMode === 'string' && APPLICATION_WORK_MODES.includes(workMode)) {
    filter.workMode = workMode;
  }
  if (typeof search === 'string' && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');
    filter.$or = [{ company: rx }, { jobTitle: rx }, { location: rx }];
  }

  const sortBy = SORTS[typeof sort === 'string' ? sort : 'newest'] || SORTS.newest;
  const applications = await Application.find(filter).sort(sortBy);
  res.json({ applications });
}

export async function getApplication(req, res) {
  const app = await findOwned(req);
  if (!app) return notFound(res);
  res.json({ application: app });
}

export async function createApplication(req, res) {
  const { data, errors, message } = parseBody(createSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const timeline = [
    {
      type: 'created',
      title: 'Application Created',
      description: `Tracked opportunity for ${data.company} (${data.jobTitle}).`,
    },
  ];
  if (data.interviewDate) {
    timeline.push({
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      description: `Interview confirmed for ${data.interviewDate}.`,
    });
  }

  const app = await Application.create({
    ...data,
    role: data.jobTitle,
    owner: req.user._id, // taken from the login, never from the request body
    timeline,
  });

  res.status(201).json({ application: app });
}

export async function updateApplication(req, res) {
  const { data, errors, message } = parseBody(updateSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const app = await findOwned(req);
  if (!app) return notFound(res);

  const previousStatus = app.status;
  const previousInterview = app.interviewDate;

  app.set(data);
  if (data.jobTitle) app.role = data.jobTitle;

  if (data.status && data.status !== previousStatus) {
    app.timeline.push({
      type: 'status_change',
      title: `Status Changed to ${data.status}`,
      description: `Updated status from ${previousStatus} to ${data.status}.`,
    });
  }
  if (data.interviewDate && data.interviewDate !== previousInterview) {
    app.timeline.push({
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      description: `Interview confirmed for ${data.interviewDate}.`,
    });
  }

  await app.save();
  res.json({ application: app });
}

export async function deleteApplication(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return notFound(res);

  const deleted = await Application.findOneAndDelete({ _id: id, owner: req.user._id });
  if (!deleted) return notFound(res);

  res.json({ message: 'Application deleted.' });
}