import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'storyduel.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id              TEXT PRIMARY KEY,
      google_sub      TEXT UNIQUE NOT NULL,
      email           TEXT,
      display_name    TEXT NOT NULL,
      age_confirmed   INTEGER NOT NULL DEFAULT 0,
      tier            TEXT NOT NULL DEFAULT 'free' CHECK(tier IN ('free','paid')),
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      invite_code   TEXT UNIQUE,
      mode          TEXT NOT NULL CHECK(mode IN ('stranger','friend')),
      status        TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting','active','completed','abandoned')),
      scenario_id   TEXT NOT NULL,
      scenario_seed TEXT,
      current_round INTEGER NOT NULL DEFAULT 0,
      write_round   INTEGER NOT NULL DEFAULT 4,
      total_rounds  INTEGER NOT NULL DEFAULT 6,
      history_summary TEXT NOT NULL DEFAULT '',
      game_state    TEXT NOT NULL DEFAULT '{"danger":20,"trust":20,"mystery":20,"chaos":20}',
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at  DATETIME
    );

    CREATE TABLE IF NOT EXISTS stories (
      id               TEXT PRIMARY KEY,
      author_user_id   TEXT NOT NULL REFERENCES users(id),
      title            TEXT NOT NULL,
      genre            TEXT NOT NULL,
      prompt           TEXT NOT NULL,
      seed_json        TEXT NOT NULL,
      length_rounds    INTEGER NOT NULL DEFAULT 6,
      visibility       TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private','published')),
      mode_support     TEXT NOT NULL DEFAULT '["duel"]',
      is_fallback_seed INTEGER NOT NULL DEFAULT 0,
      play_count       INTEGER NOT NULL DEFAULT 0,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS story_plays (
      id          TEXT PRIMARY KEY,
      story_id    TEXT NOT NULL REFERENCES stories(id),
      session_id  TEXT NOT NULL REFERENCES sessions(id),
      rating      INTEGER,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS players (
      id              TEXT PRIMARY KEY,
      session_id      TEXT NOT NULL REFERENCES sessions(id),
      user_id         TEXT REFERENCES users(id),
      display_name    TEXT NOT NULL,
      is_ai           INTEGER NOT NULL DEFAULT 0,
      secret_objective TEXT NOT NULL,
      character_role  TEXT NOT NULL DEFAULT '',
      character_want  TEXT NOT NULL DEFAULT '',
      current_round   INTEGER NOT NULL DEFAULT 0,
      socket_id       TEXT,
      connected_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id              TEXT PRIMARY KEY,
      session_id      TEXT NOT NULL REFERENCES sessions(id),
      round_number    INTEGER NOT NULL,
      round_type      TEXT NOT NULL CHECK(round_type IN ('choice','write')),
      pov             TEXT NOT NULL DEFAULT 'shared' CHECK(pov IN ('shared','a','b')),
      beat_kind       TEXT NOT NULL DEFAULT 'shared' CHECK(beat_kind IN ('shared','solo','convergence')),
      scene_text      TEXT NOT NULL,
      choices_json    TEXT,
      write_prompt    TEXT,
      state_before    TEXT NOT NULL,
      state_after     TEXT,
      is_fallback     INTEGER DEFAULT 0,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_id, round_number, pov)
    );

    CREATE TABLE IF NOT EXISTS choices_made (
      id            TEXT PRIMARY KEY,
      round_id      TEXT NOT NULL REFERENCES rounds(id),
      player_id     TEXT NOT NULL REFERENCES players(id),
      choice_text   TEXT NOT NULL,
      is_moderated  INTEGER DEFAULT 0,
      submitted_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(round_id, player_id)
    );

    CREATE TABLE IF NOT EXISTS results (
      id                      TEXT PRIMARY KEY,
      session_id              TEXT NOT NULL UNIQUE REFERENCES sessions(id),
      chemistry_score         INTEGER NOT NULL,
      insight_text            TEXT NOT NULL,
      dimension_breakdown     TEXT NOT NULL,
      match_count             INTEGER NOT NULL,
      clash_count             INTEGER NOT NULL,
      human_ai_guess          TEXT,
      human_ai_guess_correct  INTEGER,
      created_at              DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event       TEXT NOT NULL,
      session_id  TEXT REFERENCES sessions(id),
      metadata    TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_players_session ON players(session_id);
    CREATE INDEX IF NOT EXISTS idx_players_user ON players(user_id);
    CREATE INDEX IF NOT EXISTS idx_rounds_session ON rounds(session_id);
    CREATE INDEX IF NOT EXISTS idx_choices_round ON choices_made(round_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
    CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_sessions_invite ON sessions(invite_code);
    CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
    CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_user_id);
    CREATE INDEX IF NOT EXISTS idx_stories_visibility ON stories(visibility);
    CREATE INDEX IF NOT EXISTS idx_story_plays_story ON story_plays(story_id);
  `);

  migrate(d);
}

/**
 * Additive, idempotent migrations for databases created before a given
 * column/table existed. Safe to run on every boot.
 */
function migrate(d: Database.Database) {
  const playerColumns = d.prepare("PRAGMA table_info(players)").all() as { name: string }[];
  if (!playerColumns.some(c => c.name === 'user_id')) {
    d.exec('ALTER TABLE players ADD COLUMN user_id TEXT REFERENCES users(id)');
  }

  const sessionColumns = d.prepare("PRAGMA table_info(sessions)").all() as { name: string }[];
  if (!sessionColumns.some(c => c.name === 'total_rounds')) {
    d.exec('ALTER TABLE sessions ADD COLUMN total_rounds INTEGER NOT NULL DEFAULT 6');
  }
  if (!sessionColumns.some(c => c.name === 'history_summary')) {
    d.exec("ALTER TABLE sessions ADD COLUMN history_summary TEXT NOT NULL DEFAULT ''");
  }
}

// ── Query Helpers ──

export function createSession(data: {
  id: string;
  invite_code: string | null;
  mode: 'stranger' | 'friend';
  scenario_id: string;
  scenario_seed: string;
  write_round: number;
  total_rounds: number;
  game_state: string;
}) {
  const d = getDb();
  d.prepare(`
    INSERT INTO sessions (id, invite_code, mode, scenario_id, scenario_seed, write_round, total_rounds, game_state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.invite_code, data.mode, data.scenario_id, data.scenario_seed, data.write_round, data.total_rounds, data.game_state);
}

export function updateSessionHistorySummary(sessionId: string, summary: string) {
  getDb().prepare('UPDATE sessions SET history_summary = ? WHERE id = ?').run(summary, sessionId);
}

export function createPlayer(data: {
  id: string;
  session_id: string;
  display_name: string;
  is_ai: number;
  secret_objective: string;
  character_role?: string;
  character_want?: string;
  socket_id: string | null;
  user_id?: string | null;
}) {
  const d = getDb();
  d.prepare(`
    INSERT INTO players (id, session_id, display_name, is_ai, secret_objective, character_role, character_want, socket_id, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.session_id, data.display_name, data.is_ai, data.secret_objective, data.character_role || '', data.character_want || '', data.socket_id, data.user_id || null);
}

export function updatePlayerCurrentRound(playerId: string, roundNumber: number) {
  const d = getDb();
  d.prepare('UPDATE players SET current_round = ? WHERE id = ?').run(roundNumber, playerId);
}

export function createRound(data: {
  id: string;
  session_id: string;
  round_number: number;
  round_type: 'choice' | 'write';
  pov: 'shared' | 'a' | 'b';
  beat_kind: 'shared' | 'solo' | 'convergence';
  scene_text: string;
  choices_json: string | null;
  write_prompt: string | null;
  state_before: string;
  is_fallback: number;
}) {
  const d = getDb();
  d.prepare(`
    INSERT INTO rounds (id, session_id, round_number, round_type, pov, beat_kind, scene_text, choices_json, write_prompt, state_before, is_fallback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.session_id, data.round_number, data.round_type, data.pov, data.beat_kind, data.scene_text, data.choices_json, data.write_prompt, data.state_before, data.is_fallback);
}

export function saveChoice(data: {
  id: string;
  round_id: string;
  player_id: string;
  choice_text: string;
  is_moderated: number;
}) {
  const d = getDb();
  d.prepare(`
    INSERT OR IGNORE INTO choices_made (id, round_id, player_id, choice_text, is_moderated)
    VALUES (?, ?, ?, ?, ?)
  `).run(data.id, data.round_id, data.player_id, data.choice_text, data.is_moderated);
}

export function saveResult(data: {
  id: string;
  session_id: string;
  chemistry_score: number;
  insight_text: string;
  dimension_breakdown: string;
  match_count: number;
  clash_count: number;
}) {
  const d = getDb();
  d.prepare(`
    INSERT INTO results (id, session_id, chemistry_score, insight_text, dimension_breakdown, match_count, clash_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.session_id, data.chemistry_score, data.insight_text, data.dimension_breakdown, data.match_count, data.clash_count);
}

export function updateSessionStatus(sessionId: string, status: string) {
  const d = getDb();
  const updates: Record<string, string> = { status };
  if (status === 'completed') {
    d.prepare('UPDATE sessions SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, sessionId);
  } else {
    d.prepare('UPDATE sessions SET status = ? WHERE id = ?').run(status, sessionId);
  }
}

export function updateSessionRound(sessionId: string, roundNumber: number) {
  const d = getDb();
  d.prepare('UPDATE sessions SET current_round = ? WHERE id = ?').run(roundNumber, sessionId);
}

export function updateSessionGameState(sessionId: string, gameState: string) {
  const d = getDb();
  d.prepare('UPDATE sessions SET game_state = ? WHERE id = ?').run(gameState, sessionId);
}

export function updateRoundStateAfter(roundId: string, stateAfter: string) {
  const d = getDb();
  d.prepare('UPDATE rounds SET state_after = ? WHERE id = ?').run(stateAfter, roundId);
}

export function updatePlayerSocket(playerId: string, socketId: string | null) {
  const d = getDb();
  d.prepare('UPDATE players SET socket_id = ? WHERE id = ?').run(socketId, playerId);
}

export function updateGuess(sessionId: string, guess: string, correct: number) {
  const d = getDb();
  d.prepare('UPDATE results SET human_ai_guess = ?, human_ai_guess_correct = ? WHERE session_id = ?')
    .run(guess, correct, sessionId);
}

export function trackEvent(event: string, sessionId: string | null, metadata?: string) {
  const d = getDb();
  d.prepare('INSERT INTO analytics_events (event, session_id, metadata) VALUES (?, ?, ?)')
    .run(event, sessionId, metadata || null);
}

// ── Read helpers ──

export function getSession(sessionId: string) {
  return getDb().prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
}

export function getSessionByInvite(inviteCode: string) {
  return getDb().prepare('SELECT * FROM sessions WHERE invite_code = ?').get(inviteCode) as any;
}

export function getPlayers(sessionId: string) {
  return getDb().prepare('SELECT * FROM players WHERE session_id = ? ORDER BY connected_at').all(sessionId) as any[];
}

export function getPlayer(playerId: string) {
  return getDb().prepare('SELECT * FROM players WHERE id = ?').get(playerId) as any;
}

export function getRounds(sessionId: string) {
  return getDb().prepare('SELECT * FROM rounds WHERE session_id = ? ORDER BY round_number').all(sessionId) as any[];
}

export function getRound(roundId: string) {
  return getDb().prepare('SELECT * FROM rounds WHERE id = ?').get(roundId) as any;
}

export function getRoundBySessionAndNumber(sessionId: string, roundNumber: number, pov: string = 'shared') {
  return getDb().prepare('SELECT * FROM rounds WHERE session_id = ? AND round_number = ? AND pov = ?').get(sessionId, roundNumber, pov) as any;
}

export function getChoicesForRound(roundId: string) {
  return getDb().prepare('SELECT * FROM choices_made WHERE round_id = ? ORDER BY submitted_at').all(roundId) as any[];
}

export function getResult(sessionId: string) {
  return getDb().prepare('SELECT * FROM results WHERE session_id = ?').get(sessionId) as any;
}

// ── Analytics queries ──

export function getAnalytics() {
  const d = getDb();

  const totalSessions = d.prepare('SELECT COUNT(*) as count FROM sessions').get() as any;
  const todaySessions = d.prepare("SELECT COUNT(*) as count FROM sessions WHERE date(created_at) = date('now')").get() as any;
  const weekSessions = d.prepare("SELECT COUNT(*) as count FROM sessions WHERE created_at >= datetime('now', '-7 days')").get() as any;
  const monthSessions = d.prepare("SELECT COUNT(*) as count FROM sessions WHERE created_at >= datetime('now', '-30 days')").get() as any;

  const strangerGames = d.prepare("SELECT COUNT(*) as count FROM sessions WHERE mode = 'stranger'").get() as any;
  const friendGames = d.prepare("SELECT COUNT(*) as count FROM sessions WHERE mode = 'friend'").get() as any;

  const completedGames = d.prepare("SELECT COUNT(*) as count FROM sessions WHERE status = 'completed'").get() as any;

  const funnelEvents = d.prepare(`
    SELECT event, COUNT(*) as count FROM analytics_events
    GROUP BY event
  `).all() as any[];

  const avgChemistry = d.prepare('SELECT AVG(chemistry_score) as avg FROM results').get() as any;

  const scenarioStats = d.prepare(`
    SELECT scenario_id, COUNT(*) as count FROM sessions
    WHERE status = 'completed'
    GROUP BY scenario_id ORDER BY count DESC
  `).all() as any[];

  const aiMatchRate = d.prepare("SELECT COUNT(*) as count FROM players WHERE is_ai = 1").get() as any;
  const totalPlayers = d.prepare("SELECT COUNT(*) as count FROM players").get() as any;

  const guessAccuracy = d.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN human_ai_guess_correct = 1 THEN 1 ELSE 0 END) as correct
    FROM results WHERE human_ai_guess IS NOT NULL
  `).get() as any;

  const systemErrors = d.prepare("SELECT COUNT(*) as count FROM rounds WHERE is_fallback = 1").get() as any;
  const moderationFlags = d.prepare("SELECT COUNT(*) as count FROM choices_made WHERE is_moderated = 1").get() as any;

  return {
    overview: {
      total: totalSessions.count,
      today: todaySessions.count,
      week: weekSessions.count,
      month: monthSessions.count,
      stranger: strangerGames.count,
      friend: friendGames.count,
      completed: completedGames.count,
    },
    funnel: Object.fromEntries(funnelEvents.map((e: any) => [e.event, e.count])),
    engagement: {
      completionRate: totalSessions.count > 0
        ? Math.round((completedGames.count / totalSessions.count) * 100)
        : 0,
      avgChemistry: Math.round(avgChemistry.avg || 0),
    },
    stories: scenarioStats,
    matching: {
      aiRate: totalPlayers.count > 0
        ? Math.round((aiMatchRate.count / totalPlayers.count) * 100)
        : 0,
    },
    guessAccuracy: {
      total: guessAccuracy.total,
      correct: guessAccuracy.correct,
      rate: guessAccuracy.total > 0
        ? Math.round((guessAccuracy.correct / guessAccuracy.total) * 100)
        : 0,
    },
    system: {
      fallbacks: systemErrors.count,
      moderationFlags: moderationFlags.count,
    },
  };
}

// ── Custom Stories ──

export function createStory(data: {
  id: string;
  author_user_id: string;
  title: string;
  genre: string;
  prompt: string;
  seed_json: string;
  length_rounds: number;
  is_fallback_seed: boolean;
}) {
  const d = getDb();
  d.prepare(`
    INSERT INTO stories (id, author_user_id, title, genre, prompt, seed_json, length_rounds, is_fallback_seed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(data.id, data.author_user_id, data.title, data.genre, data.prompt, data.seed_json, data.length_rounds, data.is_fallback_seed ? 1 : 0);
}

export function getStoryById(storyId: string) {
  return getDb().prepare('SELECT * FROM stories WHERE id = ?').get(storyId) as any;
}

export function getStoriesByAuthor(authorUserId: string) {
  return getDb().prepare('SELECT * FROM stories WHERE author_user_id = ? ORDER BY created_at DESC').all(authorUserId) as any[];
}

export function countStoriesCreatedSince(authorUserId: string, sinceIso: string) {
  const row = getDb().prepare('SELECT COUNT(*) as count FROM stories WHERE author_user_id = ? AND created_at >= ?').get(authorUserId, sinceIso) as any;
  return row.count as number;
}

export function incrementStoryPlayCount(storyId: string) {
  getDb().prepare('UPDATE stories SET play_count = play_count + 1 WHERE id = ?').run(storyId);
}

export function recordStoryPlay(id: string, storyId: string, sessionId: string) {
  getDb().prepare('INSERT INTO story_plays (id, story_id, session_id) VALUES (?, ?, ?)').run(id, storyId, sessionId);
}

// ── Users (accounts) ──

export function upsertUserByGoogleSub(data: {
  id: string;
  google_sub: string;
  email: string | null;
  display_name: string;
}) {
  const d = getDb();
  d.prepare(`
    INSERT INTO users (id, google_sub, email, display_name)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(google_sub) DO UPDATE SET
      email = excluded.email,
      last_seen_at = CURRENT_TIMESTAMP
  `).run(data.id, data.google_sub, data.email, data.display_name);

  return getUserByGoogleSub(data.google_sub);
}

export function getUserByGoogleSub(googleSub: string) {
  return getDb().prepare('SELECT * FROM users WHERE google_sub = ?').get(googleSub) as any;
}

export function getUserById(userId: string) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
}

export function confirmUserAge(userId: string) {
  getDb().prepare('UPDATE users SET age_confirmed = 1 WHERE id = ?').run(userId);
}

export function updateUserDisplayName(userId: string, displayName: string) {
  getDb().prepare('UPDATE users SET display_name = ? WHERE id = ?').run(displayName, userId);
}

export function getUserPlayHistory(userId: string) {
  return getDb().prepare(`
    SELECT
      s.id AS session_id,
      s.scenario_id,
      s.mode,
      s.status,
      s.created_at,
      s.completed_at,
      r.chemistry_score,
      r.insight_text,
      p.display_name AS my_display_name
    FROM players p
    JOIN sessions s ON s.id = p.session_id
    LEFT JOIN results r ON r.session_id = s.id
    WHERE p.user_id = ?
    ORDER BY s.created_at DESC
    LIMIT 50
  `).all(userId) as any[];
}

/**
 * Delete an account. Player rows tied to shared game sessions are kept
 * (the other participant's history still needs them) but stripped of
 * anything identifying: display name replaced, user_id cleared.
 */
export function deleteUser(userId: string) {
  const d = getDb();
  const tx = d.transaction(() => {
    d.prepare("UPDATE players SET user_id = NULL, display_name = 'Deleted user', socket_id = NULL WHERE user_id = ?").run(userId);
    d.prepare('DELETE FROM users WHERE id = ?').run(userId);
  });
  tx();
}
