import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db';
import axios from 'axios';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '67693100136-4guqlhu2dodr82gngrueus53sii1cvod.apps.googleusercontent.com';
const isProduction = process.env.NODE_ENV === 'production';

const getBackendBaseUrl = (req: Request): string => {
  // If BASE_URL is explicitly configured (e.g. Render production), use it directly
  if (process.env.BASE_URL) {
    return process.env.BASE_URL.replace(/\/+$/, '');
  }

  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string'
    ? forwardedProto.split(',')[0].trim()
    : req.protocol;
  const host = req.get('host');
  if (host) {
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const scheme = isLocal ? proto : 'https';
    return `${scheme}://${host}`;
  }
  return 'http://localhost:5000';
};

const getAllowedFrontendOrigin = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value) return null;

  try {
    const parsed = new URL(value);
    const configuredFrontend = process.env.FRONTEND_URL;
    const configuredHost = configuredFrontend ? new URL(configuredFrontend).hostname : null;
    const hostname = parsed.hostname;

    if (
      LOCAL_HOSTNAMES.has(hostname) ||
      hostname === configuredHost ||
      hostname === 'resuone.vercel.app'
    ) {
      return parsed.origin;
    }
  } catch {
    return null;
  }

  return null;
};

const generateToken = (userId: number | string, email: string, isAdmin: boolean = false) => {
  return jwt.sign({ id: userId, email, is_admin: isAdmin }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

const DEMO_ADMIN_EMAIL = 'admin@resuone.com';
const DEMO_ADMIN_PASSWORD = 'Demo@123';

const ensureDemoAdmin = async () => {
  const demoHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  const { rows }: any = await pool.query('SELECT * FROM users WHERE email = $1', [DEMO_ADMIN_EMAIL]);

  if (rows.length === 0) {
    const { rows: inserted }: any = await pool.query(
      'INSERT INTO users (email, name, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, is_admin',
      [DEMO_ADMIN_EMAIL, 'ResuOne Admin', demoHash, true]
    );
    return { id: inserted[0].id, email: DEMO_ADMIN_EMAIL, name: 'ResuOne Admin', is_admin: inserted[0].is_admin || true };
  }

  const user = rows[0];
  await pool.query('UPDATE users SET password_hash = $1, is_admin = TRUE WHERE email = $2', [demoHash, DEMO_ADMIN_EMAIL]);
  return { id: user.id, email: user.email, name: user.name || 'ResuOne Admin', is_admin: true };
};

const setSessionCookie = (res: Response, token: string) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    // Cross-site cookie (Vercel -> Render) requires Secure + SameSite=None over HTTPS
    // In local development over HTTP, use SameSite=Lax and Secure=false
    secure: isProduction ? true : false,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const googleAuthInitiate = (req: Request, res: Response) => {
  const frontendOrigin =
    getAllowedFrontendOrigin(req.query.returnTo) ||
    (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, '') : 'https://resuone.vercel.app');
  const backendBaseUrl = getBackendBaseUrl(req);
  const redirect_uri = `${backendBaseUrl}/api/auth/google/callback`;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('profile email')}` +
    `&state=${encodeURIComponent(frontendOrigin)}` +
    `&access_type=offline` +
    `&prompt=select_account`;
  res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const frontendOrigin =
    getAllowedFrontendOrigin(req.query.state) ||
    (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, '') : 'https://resuone.vercel.app');
  const backendBaseUrl = getBackendBaseUrl(req);
  const redirect_uri = `${backendBaseUrl}/api/auth/google/callback`;

  if (!code) {
    return res.redirect(`${frontendOrigin}/auth?error=google_auth_failed`);
  }
  
  try {
    // Exchange code for tokens
    const tokenRes: any = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri,
      grant_type: "authorization_code"
    });

    // Get user info
    const userRes: any = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
    });

    const { email, id: googleId, name, picture: avatar } = userRes.data;
    
    // Database logic
    const { rows }: any = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = rows[0];

    if (!user) {
      const { rows: inserted }: any = await pool.query(
        'INSERT INTO users (google_id, email, name, avatar, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING id, is_admin',
        [googleId, email, name, avatar, false]
      );
      user = { id: inserted[0].id, email, name, avatar, is_admin: inserted[0].is_admin || false };
    } else if (!user.google_id) {
      await pool.query('UPDATE users SET google_id = $1, avatar = $2 WHERE email = $3', [googleId, avatar, email]);
      user.google_id = googleId;
      user.avatar = avatar;
    }

    const token = generateToken(user.id, user.email, user.is_admin || false);
    setSessionCookie(res, token);
    
    res.redirect(`${frontendOrigin}/dashboard`);
  } catch (error) {
    console.error('Google callback error:', error instanceof Error ? error.message : error);
    res.redirect(`${frontendOrigin}/auth?error=google_auth_failed`);
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

  try {
    const { rows }: any = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    const { rows: inserted }: any = await pool.query(
      'INSERT INTO users (email, name, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, is_admin',
      [email, name, passwordHash, false]
    );
    const id = inserted[0].id;
    const isAdmin = inserted[0].is_admin || false;

    const token = generateToken(id, email, isAdmin);
    setSessionCookie(res, token);
    
    res.json({ user: { id, email, name } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const { rows }: any = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: 'Invalid credentials or user signed up with Google' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.email, user.is_admin || false);
    setSessionCookie(res, token);
    
    res.json({ user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getSession = async (req: Request, res: Response) => {
  // authMiddleware sets req.user
  const authReq = req as any;
  if (!authReq.user) return res.status(401).json({ error: 'Not authenticated' });
  
  // In dev mode, return the dev user immediately
  if (authReq.user.email === 'dev@localhost') {
    return res.json({ user: authReq.user });
  }

  try {
    const { rows }: any = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = $1', [authReq.user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const userData = rows[0];
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction ? true : false,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
};
