// ── Matchmaking Queue ──
// In-memory queue. Players wait for a partner who chose the SAME story.
// If nobody joins within 6 seconds, an AI co-lead is silently assigned.
//
// The session is created exactly once, by whichever call performs the
// match (or the AI-fallback timer) — both sides then share one real
// session id and one real socket room.

import { v4 as uuid } from 'uuid';
import { gameManager } from './game.js';
import { trackEvent } from './db.js';

interface QueueEntry {
  key: string;
  displayName: string;
  socketId: string;
  storyId: string;
  userId: string | null;
  timer: NodeJS.Timeout;
  resolve: (match: MatchResult) => void;
}

export interface MatchResult {
  sessionId: string;
  playerId: string;
  partnerName: string;
  partnerIsAI: boolean;
  scenarioTitle: string;
}

const queue: Map<string, QueueEntry> = new Map();
const AI_FALLBACK_DELAY = 6000; // 6 seconds

const AI_NAMES = [
  'Sam', 'Alex', 'Riya', 'Kai', 'Noor', 'Zara', 'Dev', 'Mira',
  'Arjun', 'Priya', 'Vikram', 'Ananya', 'Rohan', 'Isha', 'Aditya',
  'Meera', 'Kabir', 'Tara', 'Veer', 'Sana', 'Jay', 'Aisha',
];

export function randomAIName(excludeName: string): string {
  const available = AI_NAMES.filter(n => n.toLowerCase() !== excludeName.toLowerCase());
  return available[Math.floor(Math.random() * available.length)] || 'Sam';
}

/**
 * Add a player to the matchmaking queue for a specific story.
 * Resolves once a real match is made, or an AI co-lead is assigned.
 */
export function joinQueue(displayName: string, socketId: string, storyId: string, userId: string | null = null): Promise<MatchResult> {
  return new Promise((resolve) => {
    const waiting = Array.from(queue.entries()).find(([, e]) => e.storyId === storyId);

    if (waiting) {
      const [waitingKey, waitingEntry] = waiting;
      clearTimeout(waitingEntry.timer);
      queue.delete(waitingKey);

      const sessionData = gameManager.createSession('stranger', storyId);
      const player1Id = gameManager.addPlayer(sessionData.sessionId, waitingEntry.displayName, false, sessionData.objectives[0], waitingEntry.socketId, waitingEntry.userId);
      const player2Id = gameManager.addPlayer(sessionData.sessionId, displayName, false, sessionData.objectives[1], socketId, userId);
      trackEvent('match', sessionData.sessionId);

      waitingEntry.resolve({
        sessionId: sessionData.sessionId,
        playerId: player1Id,
        partnerName: displayName,
        partnerIsAI: false,
        scenarioTitle: sessionData.scenario.title,
      });

      resolve({
        sessionId: sessionData.sessionId,
        playerId: player2Id,
        partnerName: waitingEntry.displayName,
        partnerIsAI: false,
        scenarioTitle: sessionData.scenario.title,
      });
      return;
    }

    const key = uuid();
    const timer = setTimeout(() => {
      queue.delete(key);
      const sessionData = gameManager.createSession('stranger', storyId);
      const playerId = gameManager.addPlayer(sessionData.sessionId, displayName, false, sessionData.objectives[0], socketId, userId);
      const aiName = randomAIName(displayName);
      gameManager.addPlayer(sessionData.sessionId, aiName, true, sessionData.objectives[1], null);
      trackEvent('match', sessionData.sessionId);
      resolve({
        sessionId: sessionData.sessionId,
        playerId,
        partnerName: aiName,
        partnerIsAI: true,
        scenarioTitle: sessionData.scenario.title,
      });
    }, AI_FALLBACK_DELAY);

    queue.set(key, { key, displayName, socketId, storyId, userId, timer, resolve });
  });
}

/**
 * Instantly pair a player with an AI co-lead — no queue, no wait.
 */
export function matchWithNarrator(displayName: string, socketId: string, storyId: string, userId: string | null = null): MatchResult {
  const sessionData = gameManager.createSession('stranger', storyId);
  const playerId = gameManager.addPlayer(sessionData.sessionId, displayName, false, sessionData.objectives[0], socketId, userId);
  const aiName = randomAIName(displayName);
  gameManager.addPlayer(sessionData.sessionId, aiName, true, sessionData.objectives[1], null);
  trackEvent('match', sessionData.sessionId);
  return {
    sessionId: sessionData.sessionId,
    playerId,
    partnerName: aiName,
    partnerIsAI: true,
    scenarioTitle: sessionData.scenario.title,
  };
}

/**
 * Remove a queued (not-yet-matched) player, e.g. on disconnect.
 */
export function leaveQueueBySocket(socketId: string) {
  for (const [key, entry] of queue.entries()) {
    if (entry.socketId === socketId) {
      clearTimeout(entry.timer);
      queue.delete(key);
      return;
    }
  }
}

/**
 * Get current queue size (for admin stats).
 */
export function getQueueSize(): number {
  return queue.size;
}
