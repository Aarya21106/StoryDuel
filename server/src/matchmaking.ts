// ── Matchmaking Queue ──
// In-memory queue. Players wait for a partner.
// If no human joins within 6 seconds, an AI player is silently assigned.

interface QueueEntry {
  playerId: string;
  displayName: string;
  socketId: string;
  joinedAt: number;
  timer: NodeJS.Timeout;
  resolve: (match: MatchResult) => void;
}

export interface MatchResult {
  partnerId: string | null;       // null if AI
  partnerName: string;
  partnerIsAI: boolean;
}

const queue: Map<string, QueueEntry> = new Map();
const AI_FALLBACK_DELAY = 6000; // 6 seconds

const AI_NAMES = [
  'Sam', 'Alex', 'Riya', 'Kai', 'Noor', 'Zara', 'Dev', 'Mira',
  'Arjun', 'Priya', 'Vikram', 'Ananya', 'Rohan', 'Isha', 'Aditya',
  'Meera', 'Kabir', 'Tara', 'Veer', 'Sana', 'Jay', 'Aisha',
];

function randomAIName(excludeName: string): string {
  const available = AI_NAMES.filter(n => n.toLowerCase() !== excludeName.toLowerCase());
  return available[Math.floor(Math.random() * available.length)] || 'Sam';
}

/**
 * Add a player to the matchmaking queue.
 * Returns a promise that resolves when a match is found (human or AI).
 */
export function joinQueue(playerId: string, displayName: string, socketId: string): Promise<MatchResult> {
  return new Promise((resolve) => {
    // Check if someone is already waiting
    const waitingEntries = Array.from(queue.entries());

    if (waitingEntries.length > 0) {
      // Match with the first waiting player
      const [waitingId, waitingEntry] = waitingEntries[0];
      clearTimeout(waitingEntry.timer);
      queue.delete(waitingId);

      // Resolve both: the waiting player gets this player, and vice versa
      waitingEntry.resolve({
        partnerId: playerId,
        partnerName: displayName,
        partnerIsAI: false,
      });

      resolve({
        partnerId: waitingEntry.playerId,
        partnerName: waitingEntry.displayName,
        partnerIsAI: false,
      });
      return;
    }

    // Nobody waiting — add to queue with AI fallback timer
    const timer = setTimeout(() => {
      queue.delete(playerId);
      resolve({
        partnerId: null,
        partnerName: randomAIName(displayName),
        partnerIsAI: true,
      });
    }, AI_FALLBACK_DELAY);

    queue.set(playerId, {
      playerId,
      displayName,
      socketId,
      joinedAt: Date.now(),
      timer,
      resolve,
    });
  });
}

/**
 * Remove a player from the queue (e.g. if they disconnect).
 */
export function leaveQueue(playerId: string) {
  const entry = queue.get(playerId);
  if (entry) {
    clearTimeout(entry.timer);
    queue.delete(playerId);
  }
}

/**
 * Get current queue size (for admin stats).
 */
export function getQueueSize(): number {
  return queue.size;
}
