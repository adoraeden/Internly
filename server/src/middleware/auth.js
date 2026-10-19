import User from '../models/User.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';

// Put this in front of any route that needs a logged-in user
export async function protect(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return res.status(401).json({ message: 'Account not found' });
  }

  req.user = user; // later routes use req.user to find "my" data
  next();
}