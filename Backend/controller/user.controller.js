import mongoose from 'mongoose';
import User from '../model/user.model.js';
import Efficiency from '../model/efficiency.model.js';
import { serializeUser, signAuthToken } from '../utils/auth.js';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function normalizeCredentials({ name, email, password } = {}) {
  return {
    name: typeof name === 'string' ? name.trim() : '',
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    password: typeof password === 'string' ? password : '',
  };
}

function getRequestUserId(req) {
  return req.auth?.userId || null;
}

async function findAuthenticatedUser(req) {
  const userId = getRequestUserId(req);
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return User.findById(userId);
}

// POST /user/signup
export async function signup(req, res) {
  try {
    const { name, email, password } = normalizeCredentials(req.body);
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { name }]
    }).lean();

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ message: 'Email is already registered' });
      }
      return res.status(409).json({ message: 'Name is already taken' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.status(201).json({
      token: signAuthToken(newUser._id),
      user: serializeUser(newUser),
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    return res.status(400).json({ message: err.message });
  }
}

// POST /user/login
export async function login(req, res) {
  try {
    const { email, password } = normalizeCredentials(req.body);
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: signAuthToken(user._id),
      user: serializeUser(user),
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
}

// GET /user/me
export async function getCurrentUser(req, res) {
  try {
    const user = await findAuthenticatedUser(req);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: serializeUser(user) });
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return res.status(500).json({ message: 'Failed to fetch current user' });
  }
}


// GET /user/stats
export async function getStats(req, res) {
  try {
    const user = await findAuthenticatedUser(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      totalQuestions:    user.totalQuestions,
      questionsSolved:   user.questionsSolved,
      totalEfficiency:   user.calculateEfficiency(),
      efficiencyHistory: user.efficiencyHistory || []
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ message: 'Failed to fetch stats' });
  }
}

// POST /user/solve-question
export async function solveQuestion(req, res) {
  try {
    const today = startOfDay();
    const user = await findAuthenticatedUser(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ensure name for legacy docs
    if (!user.name) {
      user.name = user.email?.split('@')?.[0] || `user_${user._id.toString().slice(-6)}`;
    }

    // increment solved; keep total >= solved so efficiency never >100
    user.questionsSolved += 1;
    if (user.totalQuestions < user.questionsSolved) {
      user.totalQuestions = user.questionsSolved;
    }

    const newEff = user.calculateEfficiency();
    const todayStr = today.toISOString().slice(0, 10);

    // update user's daily efficiencyHistory
    const last = user.efficiencyHistory[user.efficiencyHistory.length - 1];
    if (last && last.date === todayStr) {
      last.efficiency = newEff;
    } else {
      user.efficiencyHistory.push({ date: todayStr, efficiency: newEff });
    }

    // upsert daily counter in efficiencies
    await Efficiency.findOneAndUpdate(
      { user: user._id, date: today },
      {
        $inc: { problemsSolved: 1 },
        $set: { efficiency: newEff, user: user._id, date: today }
      },
      { upsert: true, new: true }
    );

    await user.save();

    return res.json({
      totalQuestions:    user.totalQuestions,
      questionsSolved:   user.questionsSolved,
      totalEfficiency:   newEff,
      efficiencyHistory: user.efficiencyHistory || []
    });
  } catch (err) {
    console.error('❌ solveQuestion error:', err);
    return res.status(500).json({ message: 'Failed to record solve' });
  }
}

// OPTIONAL: sync total questions with your backlog count
// POST /user/sync-questions  (body: { totalQuestions })
export async function syncQuestions(req, res) {
  try {
    const { totalQuestions } = req.body || {};
    if (typeof totalQuestions !== 'number' || totalQuestions < 0) {
      return res.status(400).json({ message: 'totalQuestions must be a non-negative number' });
    }

    const user = await findAuthenticatedUser(req);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.name) {
      user.name = user.email?.split('@')?.[0] || `user_${user._id.toString().slice(-6)}`;
    }

    user.totalQuestions = Math.max(totalQuestions, user.questionsSolved);

    const newEff = user.calculateEfficiency();
    const today = startOfDay();
    const todayStr = today.toISOString().slice(0, 10);
    const last = user.efficiencyHistory[user.efficiencyHistory.length - 1];
    if (last && last.date === todayStr) {
      last.efficiency = newEff;
    } else {
      user.efficiencyHistory.push({ date: todayStr, efficiency: newEff });
    }

    await user.save();

    return res.json({
      totalQuestions:    user.totalQuestions,
      questionsSolved:   user.questionsSolved,
      totalEfficiency:   newEff,
      efficiencyHistory: user.efficiencyHistory || []
    });
  } catch (err) {
    console.error('❌ syncQuestions error:', err);
    return res.status(500).json({ message: 'Failed to sync questions' });
  }
}
