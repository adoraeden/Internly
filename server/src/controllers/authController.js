import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { parseBody } from '../utils/validate.js';

const BCRYPT_ROUNDS = 12;

// Used when the email doesn't exist, so login takes the same time either way
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(60, 'Name is too long.'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(72, 'Password must be 72 characters or fewer.'),
  termsAccepted: z
    .boolean()
    .refine(v => v === true, 'Please accept the Terms of Service to continue.'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
  rememberMe: z.boolean().optional(),
});

export async function register(req, res) {
  const { data, errors, message } = parseBody(registerSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  const existing = await User.findOne({ email: data.email });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await User.create({ name: data.name, email: data.email, passwordHash });
  } catch (err) {
    // Two people registering the same email at the same moment
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    throw err;
  }

  setAuthCookie(res, user._id.toString(), true);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const { data, errors, message } = parseBody(loginSchema, req.body);
  if (!data) return res.status(400).json({ message, errors });

  // passwordHash is hidden by default, so we ask for it explicitly here
  const user = await User.findOne({ email: data.email }).select('+passwordHash');

  const passwordOk = await bcrypt.compare(data.password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !passwordOk) {
    // Same message for "no such email" and "wrong password" on purpose
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }

  setAuthCookie(res, user._id.toString(), Boolean(data.rememberMe));
  res.json({ user });
}

export function me(req, res) {
  res.json({ user: req.user });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
}