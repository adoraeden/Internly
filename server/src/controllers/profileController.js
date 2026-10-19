import { z } from 'zod';
import { parseBody } from '../utils/validate.js';

// ---------- Validation rules ----------
const text = max => z.string().trim().max(max, 'This is too long.');

const url = z
  .string()
  .trim()
  .max(300, 'Link is too long.')
  .refine(v => v === '' || /^https?:\/\//i.test(v), 'Must start with http:// or https://');

const list = (maxItems, maxLength) =>
  z
    .array(z.string().trim().min(1).max(maxLength, 'An item is too long.'))
    .max(maxItems, `Please keep this list to ${maxItems} items or fewer.`);

// .partial() means every field is optional, so the pages can save just what changed.
// Fields not listed here (email, avatarUrl, passwordHash...) are ignored.
const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name.').max(60, 'Name is too long.'),
    degree: text(100),
    headline: text(150),
    targetRole: text(100),
    location: text(100),
    portfolioUrl: url,
    linkedinUrl: url,
    githubUrl: url,
    preferredRoles: list(20, 60),
    preferredIndustries: list(20, 60),
    preferredLocations: list(20, 60),
    preferredWorkMode: z.enum(['Remote', 'Hybrid', 'On-site', 'Any']),
    employmentType: z.enum(['Internship', 'Co-op', 'New Grad', '']),
    preferredDuration: text(60),
    technicalSkills: list(50, 40),
    toolsAndTechnologies: list(50, 40),
    areasToLearn: list(50, 40),
    defaultApplicationView: z.enum(['table', 'kanban']),
    defaultSortBy: z.enum(['newest', 'oldest', 'deadline', 'company', 'role', 'priority']),
    followUpReminderDays: z.number().int().min(0).max(60),
    themePreference: z.enum(['Light', 'System']),
    notificationsEnabled: z.boolean(),
  })
  .partial();

// Photo rules: a small PNG, JPEG or WebP sent as a data URL. SVG is not allowed.
const MAX_AVATAR_CHARS = 300000; // about 220 KB of image data

const avatarSchema = z.object({
  avatar: z
    .string()
    .max(MAX_AVATAR_CHARS, 'That photo is too large. Please choose a smaller one.')
    .regex(
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/,
      'Please upload a JPEG, PNG, or WebP image.'
    ),
});

// Checks the first bytes of the decoded file, so a renamed non-image is rejected
function looksLikeImage(dataUrl) {
  const [header, b64] = dataUrl.split(',');
  const head = Buffer.from(b64.slice(0, 32), 'base64');
  if (header.includes('image/png')) {
    return head[0] === 0x89 && head.toString('ascii', 1, 4) === 'PNG';
  }
  if (header.includes('image/jpeg')) {
    return head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  }
  if (header.includes('image/webp')) {
    return head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
}

// Turns the database user into the UserProfile shape your frontend uses
function toProfileResponse(user) {
  const p = user.toObject().profile || {};
  const profile = {
    name: user.name,
    email: user.email,
    ...p,
  };
  if (user.avatarUrl) profile.avatarUrl = user.avatarUrl;
  if (!profile.employmentType) delete profile.employmentType; // frontend expects it missing, not empty
  return profile;
}

export function getProfile(req, res) {
  res.json({ profile: toProfileResponse(req.user) });
}

export async function updateProfile(req, res) {
  const { data, errors, message } = parseBody(profileSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const user = req.user;

  for (const [key, value] of Object.entries(data)) {
    if (key === 'name') {
      user.name = value;
    } else {
      user.set(`profile.${key}`, value);
    }
  }

  await user.save();
  res.json({ profile: toProfileResponse(user) });
}

export async function updateAvatar(req, res) {
  const { data, errors, message } = parseBody(avatarSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  if (!looksLikeImage(data.avatar)) {
    return res.status(400).json({ message: 'That file does not look like a valid image.' });
  }

  req.user.avatarUrl = data.avatar;
  await req.user.save();
  res.json({ profile: toProfileResponse(req.user) });
}

export async function removeAvatar(req, res) {
  req.user.avatarUrl = undefined;
  await req.user.save();
  res.json({ profile: toProfileResponse(req.user) });
}