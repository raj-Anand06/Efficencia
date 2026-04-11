import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment');
  }
  return secret;
}

export function signAuthToken(userId) {
  return jwt.sign(
    { sub: userId.toString() },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export function serializeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
