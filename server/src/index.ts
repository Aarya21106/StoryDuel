import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import { getDb, trackEvent, getSessionByInvite, getPlayers, getRound, getChoicesForRound, getSession } from './db.js';
import { gameManager } from './game.js';
import { joinQueue, leaveQueue } from './matchmaking.js';
import { generateShareCard } from './card.js';
import adminRouter from './admin.js';
import { SCENARIOS } from './scenarios.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── Initialize DB ──
getDb();

// ── Express App ──
const app = express();
app.use(cors());
app.use(express.json());

// ── Admin Routes ──
app.use('/api/admin', adminRouter);

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
  const scenario = SCENARIOS.find(s => s.id === session.scenario_id);
  res.json({
    sessionId: session.id,
    inviteCode: session.invite_code,
    creatorName: creator?.display_name || 'Someone',
    scenarioTitle: scenario?.title || 'A Story',
    status: session.status,
    hasPartner: players.length >= 2,
  });
});

// ── Serve static client in production ──
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ── HTTP + Socket.io ──
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Maps socketId -> { playerId, sessionId }
const socketSessions = new Map<string, { playerId: string; sessionId: string }>();

// Helper to schedule AI choice and trigger completion if ready
function scheduleAIForRound(roundId: string, sessionId: string, roundNumber: number, choices?: string[], writePrompt?: string) {
  const players = getPlayers(sessionId);
  const aiPlayer = players.find(p => p.is_ai === 1);
  if (!aiPlayer) return;

  const sessionDb = getSession(sessionId);
  const gameState = JSON.parse(sessionDb.game_state);
  const scenario = SCENARIOS.find(s => s.id === sessionDb.scenario_id);

  gameManager.scheduleAIChoice(
    roundId,
    aiPlayer.id,
    choices,
    writePrompt,
    scenario?.genre || 'mystery',
    gameState,
    () => {
      const currentChoices = getChoicesForRound(roundId);
      if (currentChoices.length >= 2) {
        processRoundCompletion(roundId, sessionId, roundNumber);
      }
    },
  );
}

// Helper to handle both submitted choices
async function processRoundCompletion(roundId: string, sessionId: string, roundNumber: number) {
  const players = getPlayers(sessionId);
  const sockets = await io.in(sessionId).fetchSockets();

  // 1. Emit round reveal to all connected sockets
  for (const s of sockets) {
    const sessInfo = socketSessions.get(s.id);
    if (sessInfo) {
      const reveal = gameManager.getRoundReveal(roundId, sessInfo.playerId);
      s.emit('round_reveal', reveal);
    }
  }

  // 2. Check if game is over
  if (gameManager.isGameOver(roundNumber)) {
    setTimeout(async () => {
      const results = await gameManager.generateResults(sessionId);
      const ps = getPlayers(sessionId);
      for (const s of await io.in(sessionId).fetchSockets()) {
        const sessInfo = socketSessions.get(s.id);
        if (sessInfo) {
          const player = ps.find(p => p.id === sessInfo.playerId);
          const partner = ps.find(p => p.id !== sessInfo.playerId);
          s.emit('session_complete', {
            ...results,
            objectives: {
              yours: player?.secret_objective || results.objectives.yours,
              theirs: partner?.secret_objective || results.objectives.theirs,
            },
            partnerIsAI: partner?.is_ai === 1,
            partnerName: partner?.display_name || results.partnerName,
          });
        }
      }
    }, 4500);
  } else {
    // Transition to next round
    setTimeout(async () => {
      io.to(sessionId).emit('scene_transition', {
        transitionText: 'The story is changing...',
      });

      setTimeout(async () => {
        const nextRound = await gameManager.generateNextRound(sessionId, roundNumber + 1);
        io.to(sessionId).emit('round_start', nextRound);

        // Schedule AI for the next round
        scheduleAIForRound(nextRound.roundId, sessionId, roundNumber + 1, nextRound.choices, nextRound.writePrompt);
      }, 1500);
    }, 3500);
  }
}

io.on('connection', (socket) => {
  console.log(`[WS] Connected: ${socket.id}`);

  // ── JOIN MATCHMAKING (Stranger Mode) ──
  socket.on('join_matchmaking', async (data: { displayName: string }) => {
    try {
      const { displayName } = data;

      const sessionData = gameManager.createSession('stranger');
      const playerId = gameManager.addPlayer(
        sessionData.sessionId,
        displayName,
        false,
        sessionData.objectives[0],
        socket.id,
      );

      trackEvent('match', sessionData.sessionId);

      const match = await joinQueue(playerId, displayName, socket.id);

      const partnerId = gameManager.addPlayer(
        sessionData.sessionId,
        match.partnerName,
        match.partnerIsAI,
        sessionData.objectives[1],
        match.partnerIsAI ? null : (match.partnerId || null),
      );

      socketSessions.set(socket.id, { playerId, sessionId: sessionData.sessionId });
      socket.join(sessionData.sessionId);

      socket.emit('match_found', {
        sessionId: sessionData.sessionId,
        playerId,
        partnerName: match.partnerName,
        scenarioTitle: sessionData.scenario.title,
      });

      socket.emit('objective_assigned', {
        objective: sessionData.objectives[0],
      });

      setTimeout(async () => {
        const firstRound = await gameManager.startGame(sessionData.sessionId);
        socket.emit('round_start', firstRound);

        if (match.partnerIsAI) {
          scheduleAIForRound(firstRound.roundId, sessionData.sessionId, 1, firstRound.choices, firstRound.writePrompt);
        }
      }, 2500);

    } catch (e) {
      console.error('[WS] join_matchmaking error:', e);
      socket.emit('error', { message: 'Failed to start matchmaking' });
    }
  });

  // ── CREATE INVITE (Friend Mode) ──
  socket.on('create_invite', (data: { displayName: string }) => {
    try {
      const sessionData = gameManager.createSession('friend');
      const playerId = gameManager.addPlayer(
        sessionData.sessionId,
        data.displayName,
        false,
        sessionData.objectives[0],
        socket.id,
      );

      socketSessions.set(socket.id, { playerId, sessionId: sessionData.sessionId });
      socket.join(sessionData.sessionId);

      trackEvent('invite_created', sessionData.sessionId);

      socket.emit('invite_created', {
        inviteCode: sessionData.inviteCode,
        sessionId: sessionData.sessionId,
        playerId,
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

      const scenario = SCENARIOS.find(s => s.id === session.scenario_id);
      const objectives = existingPlayers[0]?.secret_objective;

      const { pickObjectives } = await import('./scenarios.js');
      const newObjectives = pickObjectives(scenario?.genre || 'mystery');
      const joinerObjective = newObjectives[1] !== objectives ? newObjectives[1] : newObjectives[0];

      const playerId = gameManager.addPlayer(
        session.id,
        data.displayName,
        false,
        joinerObjective,
        socket.id,
      );

      socketSessions.set(socket.id, { playerId, sessionId: session.id });
      socket.join(session.id);

      trackEvent('invite_joined', session.id);

      socket.to(session.id).emit('friend_joined', {
        partnerName: data.displayName,
      });

      socket.emit('match_found', {
        sessionId: session.id,
        playerId,
        partnerName: existingPlayers[0]?.display_name || 'Someone',
        scenarioTitle: scenario?.title || 'A Story',
      });

      socket.emit('objective_assigned', {
        objective: joinerObjective,
      });

      socket.to(session.id).emit('objective_assigned', {
        objective: existingPlayers[0]?.secret_objective || '',
      });

      setTimeout(async () => {
        const firstRound = await gameManager.startGame(session.id);
        io.to(session.id).emit('round_start', firstRound);
      }, 2500);
    } catch (e) {
      console.error('[WS] join_invite error:', e);
      socket.emit('error', { message: 'Failed to join invite' });
    }
  });

  // ── SUBMIT CHOICE ──
  socket.on('submit_choice', async (data: { roundId: string; choiceText: string }) => {
    try {
      const session = socketSessions.get(socket.id);
      if (!session) return;

      const { bothSubmitted } = gameManager.submitChoice(data.roundId, session.playerId, data.choiceText);

      if (!bothSubmitted) {
        socket.to(session.sessionId).emit('partner_locked', {});
        return;
      }

      const roundInfo = getRound(data.roundId);
      processRoundCompletion(data.roundId, session.sessionId, roundInfo.round_number);

    } catch (e) {
      console.error('[WS] submit_choice error:', e);
      socket.emit('error', { message: 'Failed to submit choice' });
    }
  });

  // ── GUESS PARTNER ──
  socket.on('guess_partner', (data: { sessionId: string; guess: 'human' | 'ai' }) => {
    try {
      const result = gameManager.recordGuess(data.sessionId, data.guess);
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
    const session = socketSessions.get(socket.id);
    if (session) {
      leaveQueue(session.playerId);
      socketSessions.delete(socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n  🎭 StoryDuel server running on http://localhost:${PORT}\n`);
});
