import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuid } from 'uuid';
import {
  upsertUserByGoogleSub, getUserByGoogleSub, getUserById, confirmUserAge, getUserPlayHistory, deleteUser,
} from './db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'storyduel_dev_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const oauthClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export interface AuthedRequest extends Request {
  userId?: string;
}

// ── Session token helpers (also used by index.ts to auth sockets) ──

export function signUserToken(userId: string): string {
  return jwt.sign({ type: 'user', userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyUserToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload?.type !== 'user' || !payload.userId) return null;
    return payload.userId as string;
  } catch {
    return null;
  }
}

function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }
  const userId = verifyUserToken(authHeader.split(' ')[1]);
  if (!userId) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }
  req.userId = userId;
  next();
}

// ── Google sign-in ──
// Client uses Google Identity Services to get an ID token, sends it here.
// First-time sign-in requires ageConfirmed:true (age gate at account
// creation, not just a footer disclaimer).
router.post('/google', async (req: Request, res: Response) => {
  if (!oauthClient) {
    res.status(503).json({ error: 'Sign-in is not configured on this server yet' });
    return;
  }

  const { credential, ageConfirmed } = req.body as { credential?: string; ageConfirmed?: boolean };
  if (!credential) {
    res.status(400).json({ error: 'Missing credential' });
    return;
  }

  let payload;
  try {
    const ticket = await oauthClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    res.status(401).json({ error: 'Could not verify Google sign-in' });
    return;
  }

  if (!payload?.sub) {
    res.status(401).json({ error: 'Could not verify Google sign-in' });
    return;
  }

  const isNewUser = !getUserByGoogleSub(payload.sub);
  if (isNewUser && !ageConfirmed) {
    res.status(412).json({ error: 'age_confirmation_required' });
    return;
  }

  const user = upsertUserByGoogleSub({
    id: uuid(),
    google_sub: payload.sub,
    email: payload.email || null,
    display_name: payload.name || payload.email?.split('@')[0] || 'Player',
  });

  if (isNewUser) confirmUserAge(user.id);

  res.json({
    token: signUserToken(user.id),
    user: { id: user.id, displayName: user.display_name, tier: user.tier },
  });
});

// ── Profile + play history ──
router.get('/me', requireUser, (req: AuthedRequest, res: Response) => {
  const user = getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }
  const history = getUserPlayHistory(user.id);
  res.json({
    user: { id: user.id, displayName: user.display_name, tier: user.tier, createdAt: user.created_at },
    history: history.map(h => ({
      sessionId: h.session_id,
      storyId: h.scenario_id,
      mode: h.mode,
      status: h.status,
      playedAt: h.created_at,
      completedAt: h.completed_at,
      chemistryScore: h.chemistry_score,
      insight: h.insight_text,
    })),
  });
});

// ── Account deletion (DPDP-relevant: user-initiated erasure) ──
router.delete('/me', requireUser, (req: AuthedRequest, res: Response) => {
  deleteUser(req.userId!);
  res.json({ ok: true });
});

export default router;
export { requireUser };
