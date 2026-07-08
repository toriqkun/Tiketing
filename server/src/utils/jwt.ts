import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const generateToken = (payload: object, expiresIn: string | number = '7d') => {
  return jwt.sign(payload, SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
