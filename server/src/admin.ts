import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAnalytics } from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'storyduel_dev_secret';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'storyduel_admin_2024';

// ── Rate Limiting ──
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// ── Auth Middleware ──
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── Login ──
router.post('/login', (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  if (!rateLimit(ip)) {
    res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
    return;
  }

  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ── Stats ──
router.get('/stats', requireAuth, (_req: Request, res: Response) => {
  try {
    const analytics = getAnalytics();
    res.json(analytics);
  } catch (e) {
    console.error('[Admin] Stats error:', e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
