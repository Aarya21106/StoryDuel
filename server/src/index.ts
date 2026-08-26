import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getDb, trackEvent, getSessionByInvite, getPlayers, getPlayer, getRound, getChoicesForRound, getSession, getStoriesByAuthor, countStoriesCreatedSince, getStoryById } from './db.js';
import { gameManager, resolveScenario } from './game.js';
import { joinQueue, matchWithNarrator, leaveQueueBySocket } from './matchmaking.js';
import { generateShareCard } from './card.js';
import adminRouter from './admin.js';
import authRouter, { verifyUserToken, requireUser, type AuthedRequest } from './auth.js';
import { createCustomStory } from './storyCreator.js';
import { rateLimit } from './rateLimit.js';
import { SCENARIOS, getScenario, pickObjectives, LENGTH_OPTIONS } from './scenarios.js';
import type { StoryListItem, Scenario } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── Crash safety net ──
// Node kills the whole process on an unhandled promise rejection by
// default. The game loop below runs a lot of async work inside
// setTimeout chains that nothing awaits — a single Gemini/DB error in
// one player's session must not take down every other live session.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

/** setTimeout for an async callback that logs instead of crashing the process on failure. */
function safeDelay(fn: () => Promise<void> | void, ms: number, label: string) {
  setTimeout(() => {
    Promise.resolve().then(fn).catch((e) => {
      console.error(`[orchestration] ${label} failed:`, e);
    });
  }, ms);
}

// ── Initialize DB ──
getDb();

// ── Express App ──
const app = express();
app.use(cors());
app.use(express.json());

// ── Admin Routes ──
app.use('/api/admin', adminRouter);

// ── Auth Routes ──
app.use('/api/auth', authRouter);

// ── Story Library ──
app.get('/api/stories', (_req, res) => {
  const list: StoryListItem[] = SCENARIOS.map(s => ({
    id: s.id,
    title: s.title,
    genre: s.genre,
    logline: s.logline,
    synopsis: s.synopsis,
    toneTags: s.toneTags,
    runtime: s.runtime,
    grade: s.grade,
  }));
  res.json({ stories: list });
});

// ── Custom Stories (Phase 2) ──

const STORY_CREATION_LIMIT_PER_HOUR = 5;

app.post('/api/stories/custom', requireUser, async (req: AuthedRequest, res) => {
  try {
    const { prompt, genre, lengthRounds } = req.body as { prompt?: string; genre?: string; lengthRounds?: number };
    const validGenres: Scenario['genre'][] = ['mystery', 'horror', 'romance', 'adventure', 'emotional', 'comedy', 'scifi', 'chaos'];

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'A story prompt is required' });
      return;
    }
    if (!genre || !validGenres.includes(genre as Scenario['genre'])) {
      res.status(400).json({ error: 'Invalid genre' });
      return;
    }
    if (!lengthRounds || !LENGTH_OPTIONS.some(o => o.rounds === lengthRounds)) {
      res.status(400).json({ error: 'Invalid story length' });
      return;
    }

    if (!rateLimit(`story-create:${req.userId}`, STORY_CREATION_LIMIT_PER_HOUR, 60 * 60 * 1000)) {
      res.status(429).json({ error: `You can create up to ${STORY_CREATION_LIMIT_PER_HOUR} stories per hour. Try again soon.` });
      return;
    }

    const result = await createCustomStory({
      authorUserId: req.userId!,
      prompt,
      genre: genre as Scenario['genre'],
      lengthRounds,
    });

    if (!result.ok) {
      res.status(422).json({ error: result.error });
      return;
    }

    res.json({ story: result.story });
  } catch (e) {
    console.error('[API] create custom story error:', e);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

app.get('/api/stories/mine', requireUser, (req: AuthedRequest, res) => {
  const stories = getStoriesByAuthor(req.userId!);
  res.json({
    stories: stories.map((s: any) => {
      const scenario = resolveScenario(s.id)!;
      return {
        id: s.id,
        title: s.title,
        genre: s.genre,
        logline: scenario.logline,
        synopsis: scenario.synopsis,
        toneTags: scenario.toneTags,
        runtime: scenario.runtime,
        grade: scenario.grade,
        visibility: s.visibility,
        playCount: s.play_count,
        createdAt: s.created_at,
      };
    }),
  });
});

app.get('/api/stories/:id', (req, res) => {
  const row = getStoryById(req.params.id);
  if (!row) {
    // Not a custom story — let the client fall back to the built-in list.
    res.status(404).json({ error: 'Story not found' });
    return;
  }

  if (row.visibility === 'private') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const userId = token ? verifyUserToken(token) : null;
    if (!userId || userId !== row.author_user_id) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }
  }

  const scenario = resolveScenario(row.id)!;
  res.json({
    id: scenario.id,
    title: scenario.title,
    genre: scenario.genre,
    logline: scenario.logline,
    synopsis: scenario.synopsis,
    toneTags: scenario.toneTags,
    runtime: scenario.runtime,
    grade: scenario.grade,
  });
});

// ── Share Card Route ──
app.get('/api/card/:sessionId', (req, res) => {
  const svg = generateShareCard(req.params.sessionId);
  if (!svg) {
    res.status(404).json({ error: 'Card not found' });
    return;
  }
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// ── Friend Join Page ──
app.get('/api/invite/:code', (req, res) => {
  const session = getSessionByInvite(req.params.code.toUpperCase());
  if (!session) {
    res.status(404).json({ error: 'Invite not found' });
    return;
  }
  const players = getPlayers(session.id);
  const creator = players[0];
  const scenario = resolveScenario(session.scenario_id);
  res.json({
    sessionId: session.id,
    inviteCode: session.invite_code,
    creatorName: creator?.display_name || 'Someone',
    scenarioTitle: scenario?.title || 'A Story',
    logline: scenario?.logline || '',
    toneTags: scenario?.toneTags || [],
    runtime: scenario?.runtime || '',
    grade: scenario?.grade || null,
    status: session.status,
    hasPartner: players.length >= 2,
  });
});

// ── Serve static client, only if it was built alongside the server ──
// (Not the case when the client is deployed separately, e.g. on Vercel.)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.json({ ok: true, service: 'storyduel-server' });
  });
}

// ── HTTP + Socket.io ──
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Optional auth: if the client passed a signed-in user's JWT, resolve it
// to a userId so their game history gets linked. Guests connect fine
// without one — never gate the game itself behind sign-in.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (token) {
    const userId = verifyUserToken(token);
    if (userId) socket.data.userId = userId;
  }
  next();
});

// Maps socketId -> { playerId, sessionId }
const socketSessions = new Map<string, { playerId: string; sessionId: string }>();
// sessionId -> Set of playerIds who confirmed the briefing
const readySets = new Map<string, Set<string>>();

function emitToPlayer(sessionId: string, playerId: string, event: string, payload: any) {
  const player = getPlayer(playerId);
  if (!player || player.is_ai === 1 || !player.socket_id) return;
  io.to(player.socket_id).emit(event, payload);
}

// ── AI Scheduling Helpers ──

function scheduleAI(sessionId: string, roundId: string, choices: string[] | undefined, writePrompt: string | undefined, onComplete: (aiPlayerId: string) => void) {
  const players = getPlayers(sessionId);
  const aiPlayer = players.find((p: any) => p.is_ai === 1);
  if (!aiPlayer) return;

  const sessionDb = getSession(sessionId);
  const gameState = JSON.parse(sessionDb.game_state);
  const scenario = resolveScenario(sessionDb.scenario_id);

  gameManager.scheduleAIChoice(
    roundId, aiPlayer.id, choices, writePrompt, scenario?.genre || 'mystery', gameState,
    () => onComplete(aiPlayer.id),
  );
}

/**
 * Called after the AI submits into a SHARED round. Only actually advances
 * the round if the human has also submitted — otherwise just flips the
 * "partner locked" indicator, exactly like the human-submits-first path.
 */
function resolveAfterAISubmission(sessionId: string, roundId: string, roundNumber: number) {
  const round = getRound(roundId);
  const choices = getChoicesForRound(roundId);
  const complete = round.pov === 'shared' ? choices.length >= 2 : choices.length >= 1;

  if (!complete) {
    io.to(sessionId).emit('partner_locked', {});
    return;
  }
  handleSharedSubmitted(sessionId, roundId, roundNumber);
}

// ── Solo Lane Orchestration (variable-length, driven by the round plan) ──

async function beginSoloRoundForPlayer(sessionId: string, playerId: string, roundNumber: number) {
  const player = getPlayer(playerId);
  const round = await gameManager.generateSoloRound(sessionId, playerId, roundNumber);

  if (player.is_ai === 1) {
    scheduleAI(sessionId, round.roundId, round.choices, round.writePrompt, () => {
      handleSoloSubmitted(sessionId, playerId, roundNumber);
    });
  } else {
    emitToPlayer(sessionId, playerId, 'round_start', round);
  }
}

async function handleSoloSubmitted(sessionId: string, playerId: string, roundNumber: number) {
  const plan = gameManager.getRoundPlan(sessionId);
  const idx = plan.soloRounds.indexOf(roundNumber);
  const isLastSolo = idx === -1 || idx === plan.soloRounds.length - 1;

  if (!isLastSolo) {
    emitToPlayer(sessionId, playerId, 'lane_advance', { message: 'Your choice sets things in motion...' });
    const nextRound = plan.soloRounds[idx + 1];
    safeDelay(() => beginSoloRoundForPlayer(sessionId, playerId, nextRound), 2200, 'begin next solo round');
    return;
  }

  // Last solo round for this player — their lane is complete.
  const players = getPlayers(sessionId);
  const partner = players.find((p: any) => p.id !== playerId);
  const partnerPov = partner ? gameManager.povOfPlayer(sessionId, partner.id) : null;
  const partnerDone = partner && partnerPov && gameManager.laneComplete(sessionId, partnerPov);

  if (!partnerDone) {
    emitToPlayer(sessionId, playerId, 'lane_waiting', { message: 'Waiting for their story to catch back up to yours...' });
    return;
  }

  // Both lanes complete — converge.
  io.to(sessionId).emit('story_converging', { message: 'Your paths are about to cross again...' });
  safeDelay(async () => {
    const convergenceRound = await gameManager.generateSharedRound(sessionId, plan.convergenceRound);
    io.to(sessionId).emit('round_start', convergenceRound);
    scheduleAI(sessionId, convergenceRound.roundId, convergenceRound.choices, convergenceRound.writePrompt, () => {
      resolveAfterAISubmission(sessionId, convergenceRound.roundId, plan.convergenceRound);
    });
  }, 2600, 'generate convergence round');
}

// ── Shared Round Orchestration (rounds 1, 4, 5, 6) ──

async function handleSharedSubmitted(sessionId: string, roundId: string, roundNumber: number) {
  const players = getPlayers(sessionId);
  const sockets = await io.in(sessionId).fetchSockets();

  for (const s of sockets) {
    const info = socketSessions.get(s.id);
    if (info) {
      const reveal = gameManager.getRoundReveal(roundId, info.playerId);
      s.emit('round_reveal', reveal);
    }
  }

  if (roundNumber === 1) {
    const plan = gameManager.getRoundPlan(sessionId);
    const firstSoloRound = plan.soloRounds[0];
    safeDelay(() => {
      io.to(sessionId).emit('scene_transition', { transitionText: 'Your paths are about to split...' });
      safeDelay(async () => {
        for (const p of players) {
          beginSoloRoundForPlayer(sessionId, p.id, firstSoloRound);
        }
      }, 1500, 'begin solo lanes');
    }, 3200, 'round 1 -> split transition');
    return;
  }

  if (gameManager.isGameOver(sessionId, roundNumber)) {
    safeDelay(async () => {
      const results = await gameManager.generateResults(sessionId);
      for (const s of await io.in(sessionId).fetchSockets()) {
        const info = socketSessions.get(s.id);
        if (info) {
          const player = players.find((p: any) => p.id === info.playerId);
          const partner = players.find((p: any) => p.id !== info.playerId);
          s.emit('session_complete', {
            ...results,
            transcript: results.transcriptFor(info.playerId),
            objectives: { yours: player?.secret_objective || '', theirs: partner?.secret_objective || '' },
            partnerIsAI: partner?.is_ai === 1,
            partnerName: partner?.display_name || results.partnerName,
          });
        }
      }
    }, 4500, 'generate final results');
    return;
  }

  safeDelay(async () => {
    io.to(sessionId).emit('scene_transition', { transitionText: 'The story continues...' });
    safeDelay(async () => {
      const nextRound = await gameManager.generateSharedRound(sessionId, roundNumber + 1);
      io.to(sessionId).emit('round_start', nextRound);
      scheduleAI(sessionId, nextRound.roundId, nextRound.choices, nextRound.writePrompt, () => {
        resolveAfterAISubmission(sessionId, nextRound.roundId, roundNumber + 1);
      });
    }, 1500, 'generate next shared round');
  }, 3200, 'shared round transition');
}

async function startTheGame(sessionId: string) {
  try {
    const firstRound = await gameManager.startGame(sessionId);
    io.to(sessionId).emit('round_start', firstRound);
    scheduleAI(sessionId, firstRound.roundId, firstRound.choices, firstRound.writePrompt, () => {
      resolveAfterAISubmission(sessionId, firstRound.roundId, 1);
    });
  } catch (e) {
    console.error('[orchestration] startTheGame failed:', e);
    io.to(sessionId).emit('error', { message: 'Something went wrong starting the story. Please try again.' });
  }
}

io.on('connection', (socket) => {
  console.log(`[WS] Connected: ${socket.id}`);

  // ── JOIN MATCHMAKING (Stranger / Narrator Mode) ──
  socket.on('join_matchmaking', async (data: { displayName: string; storyId?: string; instantAI?: boolean }) => {
    try {
      const { displayName, storyId, instantAI } = data;
      const chosenStoryId = storyId && resolveScenario(storyId) ? storyId : SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)].id;

      const userId = (socket.data.userId as string | undefined) || null;
      const match = instantAI
        ? matchWithNarrator(displayName, socket.id, chosenStoryId, userId)
        : await joinQueue(displayName, socket.id, chosenStoryId, userId);

      socketSessions.set(socket.id, { playerId: match.playerId, sessionId: match.sessionId });
      socket.join(match.sessionId);

      socket.emit('match_found', {
        sessionId: match.sessionId,
        playerId: match.playerId,
        partnerName: match.partnerName,
        scenarioTitle: match.scenarioTitle,
      });

      socket.emit('story_brief', gameManager.buildStoryBrief(match.sessionId, match.playerId));
    } catch (e) {
      console.error('[WS] join_matchmaking error:', e);
      socket.emit('error', { message: 'Failed to start matchmaking' });
    }
  });

  // ── CREATE INVITE (Friend Mode) ──
  socket.on('create_invite', (data: { displayName: string; storyId?: string }) => {
    try {
      const sessionData = gameManager.createSession('friend', data.storyId);
      const playerId = gameManager.addPlayer(
        sessionData.sessionId,
        data.displayName,
        false,
        sessionData.objectives[0],
        socket.id,
        (socket.data.userId as string | undefined) || null,
      );

      socketSessions.set(socket.id, { playerId, sessionId: sessionData.sessionId });
      socket.join(sessionData.sessionId);

      trackEvent('invite_created', sessionData.sessionId);

      socket.emit('invite_created', {
        inviteCode: sessionData.inviteCode,
        sessionId: sessionData.sessionId,
        playerId,
        storyTitle: sessionData.scenario.title,
      });
    } catch (e) {
      console.error('[WS] create_invite error:', e);
      socket.emit('error', { message: 'Failed to create invite' });
    }
  });

  // ── JOIN INVITE (Friend Mode) ──
  socket.on('join_invite', async (data: { inviteCode: string; displayName: string }) => {
    try {
      const session = getSessionByInvite(data.inviteCode.toUpperCase());
      if (!session) {
        socket.emit('error', { message: 'Invite not found' });
        return;
      }

      const existingPlayers = getPlayers(session.id);
      if (existingPlayers.length >= 2) {
        socket.emit('error', { message: 'This story already has two players' });
        return;
      }

      const scenario = resolveScenario(session.scenario_id);
      const firstObjective = existingPlayers[0]?.secret_objective;
      const newObjectives = pickObjectives(scenario?.genre || 'mystery');
      const joinerObjective = newObjectives[1] !== firstObjective ? newObjectives[1] : newObjectives[0];

      const playerId = gameManager.addPlayer(
        session.id,
        data.displayName,
        false,
        joinerObjective,
        socket.id,
        (socket.data.userId as string | undefined) || null,
      );

      socketSessions.set(socket.id, { playerId, sessionId: session.id });
      socket.join(session.id);

      trackEvent('invite_joined', session.id);

      socket.to(session.id).emit('friend_joined', { partnerName: data.displayName });

      socket.emit('match_found', {
        sessionId: session.id,
        playerId,
        partnerName: existingPlayers[0]?.display_name || 'Someone',
        scenarioTitle: scenario?.title || 'A Story',
      });
      socket.emit('story_brief', gameManager.buildStoryBrief(session.id, playerId));

      if (existingPlayers[0]) {
        emitToPlayer(session.id, existingPlayers[0].id, 'match_found', {
          sessionId: session.id,
          playerId: existingPlayers[0].id,
          partnerName: data.displayName,
          scenarioTitle: scenario?.title || 'A Story',
        });
        emitToPlayer(session.id, existingPlayers[0].id, 'story_brief', gameManager.buildStoryBrief(session.id, existingPlayers[0].id));
      }
    } catch (e) {
      console.error('[WS] join_invite error:', e);
      socket.emit('error', { message: 'Failed to join invite' });
    }
  });

  // ── BRIEFING CONFIRMED ──
  socket.on('ready_for_round1', () => {
    const session = socketSessions.get(socket.id);
    if (!session) return;

    const set = readySets.get(session.sessionId) || new Set<string>();
    set.add(session.playerId);
    readySets.set(session.sessionId, set);

    const players = getPlayers(session.sessionId);
    const humanCount = players.filter((p: any) => p.is_ai !== 1).length;

    if (set.size >= Math.max(humanCount, 1)) {
      readySets.delete(session.sessionId);
      startTheGame(session.sessionId);
    }
  });

  // ── SUBMIT CHOICE ──
  socket.on('submit_choice', async (data: { roundId: string; choiceText: string }) => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) return;

      const result = gameManager.submitChoice(data.roundId, session.playerId, data.choiceText);
      const roundInfo = getRound(data.roundId);

      if (result.pov !== 'shared') {
        handleSoloSubmitted(session.sessionId, session.playerId, roundInfo.round_number);
        return;
      }

      if (!result.complete) {
        socket.to(session.sessionId).emit('partner_locked', {});
        return;
      }

      handleSharedSubmitted(session.sessionId, data.roundId, roundInfo.round_number);
    } catch (e) {
      console.error('[WS] submit_choice error:', e);
      socket.emit('error', { message: 'Failed to submit choice' });
    }
  });

  // ── GUESS PARTNER ──
  socket.on('guess_partner', (data: { sessionId: string; guess: 'human' | 'ai' }) => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) return;
      const result = gameManager.recordGuess(session.sessionId, session.playerId, data.guess);
      socket.emit('guess_result', result);
    } catch (e) {
      console.error('[WS] guess_partner error:', e);
    }
  });

  // ── REPLAY ──
  socket.on('request_replay', () => {
    const session = socketSessions.get(socket.id);
    if (session) {
      trackEvent('replay', session.sessionId);
    }
  });

  // ── TRACK EVENT ──
  socket.on('track_event', (data: { event: string; sessionId?: string }) => {
    trackEvent(data.event, data.sessionId || null);
  });

  // ── DISCONNECT ──
  socket.on('disconnect', () => {
    console.log(`[WS] Disconnected: ${socket.id}`);
    leaveQueueBySocket(socket.id);
    const session = socketSessions.get(socket.id);
    if (session) {
      socketSessions.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n  StoryDuel server running on http://localhost:${PORT}\n`);
});
