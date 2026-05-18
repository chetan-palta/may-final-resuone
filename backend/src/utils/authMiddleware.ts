import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const DEV_MODE_USER = {
  id: 'dev-user-1',
  email: 'dev@localhost',
  is_admin: false
};

const isLocalhost = (req: Request): boolean => {
  const host = req.get('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Dev mode bypass: if localhost and NODE_ENV is not production, auto-authenticate
  const isDevMode = process.env.NODE_ENV !== 'production' && isLocalhost(req);
  if (isDevMode) {
    console.log('[DEV MODE] Auto-authenticating request from localhost');
    (req as any).user = DEV_MODE_USER;
    return next();
  }

  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded; // attaching decoded payload to req
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
