import mongoose from 'mongoose';
import { verifyAuthToken } from '../utils/auth.js';

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = header.slice(7).trim();
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const payload = verifyAuthToken(token);
    const userId = payload?.sub;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }

    req.auth = { userId };
    next();
  } catch (_err) {
    return res.status(401).json({ message: 'Invalid or expired authorization token' });
  }
}
