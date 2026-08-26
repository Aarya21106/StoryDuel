import { v4 as uuid } from 'uuid';
import * as db from './db.js';
import { pickScenario, getScenario, storyRowToScenario, generateSeed, pickObjectives, pickWriteRound } from './scenarios.js';
import { getFallbackBeat } from './fallbacks.js';
import { generateRoundScene, generateFinalAnalysis, fallbackAnalysis, summarizeRoundsDeterministic } from './ai.js';
import { pickAIChoice, pickAIWriteResponse, getAIDelay } from './aiPlayer.js';
import { moderateText } from './moderation.js';
import type {
  GameState, AIRoundResponse, RoundStartPayload, RoundRevealPayload,
  SessionCompletePayload, StoryBriefPayload, TranscriptItem, Scenario,
} from './types.js';

// A handful of fallback beats were originally authored assuming a
// different round held the free-text beat, and ship with an empty
// choices array. If a fallback beat is used for a 'choice' round and
// has no choices, fall back to these instead of showing an empty round.
const GENERIC_CHOICES = [
  'Move toward whatever just happened.',
  'Hold your ground and watch closely.',
  'Get out before it goes any further.',
];

// Round map, generalized for any story length (6/12/20 rounds):
//   1                    shared      — the opening, together
//   2 .. convergence-1   solo        — each player walks their own lane, apart
//   convergence          convergence — shared scene, paths cross again
//   convergence+1 .. N   shared      — together again for the close (one is a write beat)
//
// ~40% of the middle rounds are spent apart; this exactly reproduces the
// original fixed 6-round plan (solo rounds 2-3, convergence round 4) and
// scales the same shape up for longer custom stories.

export interface RoundPlan {
  soloRounds: number[];
  convergenceRound: number;
  totalRounds: number;
}

export function computeRoundPlan(totalRounds: number): RoundPlan {
  if (totalRounds <= 3) {
    return { soloRounds: [], convergenceRound: totalRounds, totalRounds };
  }
  const soloCount = Math.max(1, Math.round((totalRounds - 2) * 0.4));
  const soloRounds = Array.from({ length: soloCount }, (_, i) => 2 + i);
  const convergenceRound = 2 + soloCount;
  return { soloRounds, convergenceRound, totalRounds };
}

function beatKindForRound(roundNumber: number, plan: RoundPlan): 'shared' | 'solo' | 'convergence' {
  if (plan.soloRounds.includes(roundNumber)) return 'solo';
  if (roundNumber === plan.convergenceRound) return 'convergence';
  return 'shared';
}

/** Resolve a story id to its Scenario shape — a built-in story first, then a custom (DB-backed) one. */
export function resolveScenario(scenarioId: string): Scenario | undefined {
  const builtIn = getScenario(scenarioId);
  if (builtIn) return builtIn;
  const row = db.getStoryById(scenarioId);
  return row ? storyRowToScenario(row) : undefined;
}

// ── Reaction Phrases ──

const MATCH_REACTIONS = [
  "Same brain.",
  "You two thought the same thing.",
  "Okay that's kinda scary.",
  "Wait. You both chose that?",
  "Great minds, apparently.",
  "Telepathy confirmed.",
  "Okay you two are in sync.",
  "That's a match.",
];

const CLASH_REACTIONS = [
  "Okay... this got interesting.",
  "Different paths, same story.",
  "Well. That changes things.",
  "You went opposite ways.",
  "That's a split decision.",
  "They went the other direction.",
  "Interesting contrast.",
  "You saw that very differently.",
];

function randomReaction(matched: boolean): string {
  const pool = matched ? MATCH_REACTIONS : CLASH_REACTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Invite Code Generator ──

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ── State Helpers ──

function applyDelta(state: GameState, delta: Partial<GameState>): GameState {
  return {
    danger: Math.max(0, Math.min(100, state.danger + (delta.danger || 0))),
    trust: Math.max(0, Math.min(100, state.trust + (delta.trust || 0))),
    mystery: Math.max(0, Math.min(100, state.mystery + (delta.mystery || 0))),
    chaos: Math.max(0, Math.min(100, state.chaos + (delta.chaos || 0))),
  };
}

function povOf(players: any[], playerId: string): 'a' | 'b' {
  return players[0]?.id === playerId ? 'a' : 'b';
}

// ── GameManager ──

export class GameManager {

  /**
   * Create a new game session (stranger or friend mode), for a chosen story.
   */
  createSession(mode: 'stranger' | 'friend', storyId?: string): {
    sessionId: string;
    inviteCode: string | null;
    scenario: { id: string; title: string; genre: string; opening: string };
    seed: ReturnType<typeof generateSeed>;
    writeRound: number;
    totalRounds: number;
    objectives: [string, string];
    initialState: GameState;
  } {
    const sessionId = uuid();
    const scenario = (storyId && resolveScenario(storyId)) || pickScenario();
    // Custom stories carry their own fixed flavor seed (part of the
    // authored premise) and their creator-chosen length; built-in
    // stories get a fresh combinatorial seed each play and are fixed
    // at 6 rounds.
    const seed = scenario.customSeed || generateSeed();
    const totalRounds = scenario.lengthRounds || 6;
    const writeRound = pickWriteRound(totalRounds);
    const objectives = pickObjectives(scenario.genre);
    const inviteCode = mode === 'friend' ? generateInviteCode() : null;

    db.createSession({
      id: sessionId,
      invite_code: inviteCode,
      mode,
      scenario_id: scenario.id,
      scenario_seed: JSON.stringify(seed),
      write_round: writeRound,
      total_rounds: totalRounds,
      game_state: JSON.stringify(scenario.initialState),
    });

    if (!getScenario(scenario.id)) {
      // Custom (DB-backed) story — track that it got played.
      db.incrementStoryPlayCount(scenario.id);
      db.recordStoryPlay(uuid(), scenario.id, sessionId);
    }

    return {
      sessionId,
      inviteCode,
      scenario: { id: scenario.id, title: scenario.title, genre: scenario.genre, opening: scenario.opening },
      seed,
      writeRound,
      totalRounds,
      objectives,
      initialState: scenario.initialState,
    };
  }

  /**
   * Add a player to a session. First player added becomes POV 'a', second 'b'.
   */
  addPlayer(sessionId: string, displayName: string, isAI: boolean, objective: string, socketId: string | null, userId?: string | null): string {
    const playerId = uuid();
    const session = db.getSession(sessionId);
    const scenario = resolveScenario(session.scenario_id);
    const existing = db.getPlayers(sessionId);
    const castSlot = existing.length === 0 ? scenario?.castA : scenario?.castB;

    db.createPlayer({
      id: playerId,
      session_id: sessionId,
      display_name: displayName,
      is_ai: isAI ? 1 : 0,
      secret_objective: objective,
      character_role: castSlot?.role || '',
      character_want: castSlot?.want || '',
      user_id: userId || null,
      socket_id: socketId,
    });
    return playerId;
  }

  /**
   * Build the pre-game Briefing payload for one player: the situation, who
   * they are (with their real secret), and who the other lead is (no secret).
   */
  buildStoryBrief(sessionId: string, playerId: string): StoryBriefPayload {
    const session = db.getSession(sessionId);
    const scenario = resolveScenario(session.scenario_id)!;
    const players = db.getPlayers(sessionId);
    const me = players.find((p: any) => p.id === playerId);
    const partner = players.find((p: any) => p.id !== playerId);
    const pov = povOf(players, playerId);
    const myCast = pov === 'a' ? scenario.castA : scenario.castB;
    const theirCast = pov === 'a' ? scenario.castB : scenario.castA;

    return {
      title: scenario.title,
      logline: scenario.logline,
      synopsis: scenario.synopsis,
      toneTags: scenario.toneTags,
      grade: scenario.grade,
      you: {
        name: myCast.name,
        role: myCast.role,
        want: myCast.want,
        secret: me?.secret_objective || '',
      },
      them: {
        name: partner ? theirCast.name : theirCast.name,
        role: theirCast.role,
        want: theirCast.want,
      },
    };
  }

  /**
   * Start the game — activate session and generate the first (shared) round.
   */
  async startGame(sessionId: string): Promise<RoundStartPayload> {
    db.updateSessionStatus(sessionId, 'active');
    db.trackEvent('started', sessionId);
    return this.generateSharedRound(sessionId, 1);
  }

  /**
   * Generate a SHARED beat: the opening (1), the convergence (4), or a joint
   * closing beat (5, 6). Both players see identical content.
   */
  async generateSharedRound(sessionId: string, roundNumber: number): Promise<RoundStartPayload> {
    const session = db.getSession(sessionId);
    const scenario = resolveScenario(session.scenario_id)!;
    const currentState: GameState = JSON.parse(session.game_state);
    const seed = JSON.parse(session.scenario_seed);
    const isWriteRound = roundNumber === session.write_round;
    const roundType = isWriteRound ? 'write' : 'choice';
    const plan = computeRoundPlan(session.total_rounds);
    const beatKind = beatKindForRound(roundNumber, plan);

    const history = this.buildSharedHistory(sessionId, roundNumber, session.total_rounds, session.history_summary);

    let sceneData: AIRoundResponse | null = null;

    if (roundNumber === 1) {
      sceneData = {
        scene: scenario.opening,
        choices: isWriteRound ? undefined : getFallbackBeat(scenario.id, 1, false).choices,
        write_prompt: isWriteRound ? getFallbackBeat(scenario.id, 1, true).writePrompt : undefined,
        state_delta: { danger: 0, trust: 0, mystery: 0, chaos: 0 },
      };
    } else {
      sceneData = await generateRoundScene({
        scenarioTitle: scenario.title,
        seed,
        currentState,
        history,
        roundNumber,
        roundType,
        beatKind,
        povCharacterName: scenario.castA.name,
        otherCharacterName: scenario.castB.name,
      });

      if (!sceneData) {
        sceneData = await generateRoundScene({
          scenarioTitle: scenario.title,
          seed,
          currentState,
          history,
          roundNumber,
          roundType,
          beatKind,
          povCharacterName: scenario.castA.name,
          otherCharacterName: scenario.castB.name,
        });
      }
    }

    let isFallback = 0;
    if (!sceneData) {
      isFallback = 1;
      const fallback = getFallbackBeat(scenario.id, roundNumber, isWriteRound);
      const safeChoices = fallback.choices && fallback.choices.length > 0 ? fallback.choices : GENERIC_CHOICES;
      sceneData = {
        scene: fallback.scene,
        choices: isWriteRound ? undefined : safeChoices,
        write_prompt: isWriteRound ? (fallback.writePrompt || 'What do you say?') : undefined,
        state_delta: fallback.stateDelta,
      };
    }

    const roundId = uuid();
    db.createRound({
      id: roundId,
      session_id: sessionId,
      round_number: roundNumber,
      round_type: roundType,
      pov: 'shared',
      beat_kind: beatKind,
      scene_text: sceneData.scene,
      choices_json: sceneData.choices ? JSON.stringify(sceneData.choices) : null,
      write_prompt: sceneData.write_prompt || null,
      state_before: JSON.stringify(currentState),
      is_fallback: isFallback,
    });

    const newState = applyDelta(currentState, sceneData.state_delta);
    db.updateSessionGameState(sessionId, JSON.stringify(newState));
    db.updateRoundStateAfter(roundId, JSON.stringify(newState));
    db.updateSessionRound(sessionId, roundNumber);
    this.refreshHistorySummaryIfNeeded(sessionId, session.total_rounds);

    return {
      roundId,
      roundNumber,
      totalRounds: session.total_rounds,
      roundType,
      beatKind,
      sceneText: sceneData.scene,
      choices: sceneData.choices,
      writePrompt: sceneData.write_prompt,
    };
  }

  /**
   * Generate a SOLO beat for exactly one player, built only from that
   * player's own lane. The other player never sees this content until
   * the final reveal.
   */
  async generateSoloRound(sessionId: string, playerId: string, roundNumber: number): Promise<RoundStartPayload> {
    const session = db.getSession(sessionId);
    const scenario = resolveScenario(session.scenario_id)!;
    const currentState: GameState = JSON.parse(session.game_state);
    const seed = JSON.parse(session.scenario_seed);
    const players = db.getPlayers(sessionId);
    const pov = povOf(players, playerId);
    const myCast = pov === 'a' ? scenario.castA : scenario.castB;
    const theirCast = pov === 'a' ? scenario.castB : scenario.castA;

    const history = this.buildSoloHistory(sessionId, pov, roundNumber, session.total_rounds, session.history_summary);

    let sceneData = await generateRoundScene({
      scenarioTitle: scenario.title,
      seed,
      currentState,
      history,
      roundNumber,
      roundType: 'choice',
      beatKind: 'solo',
      povCharacterName: myCast.name,
      otherCharacterName: theirCast.name,
    });

    if (!sceneData) {
      sceneData = await generateRoundScene({
        scenarioTitle: scenario.title,
        seed,
        currentState,
        history,
        roundNumber,
        roundType: 'choice',
        beatKind: 'solo',
        povCharacterName: myCast.name,
        otherCharacterName: theirCast.name,
      });
    }

    let isFallback = 0;
    if (!sceneData) {
      isFallback = 1;
      const fallback = getFallbackBeat(scenario.id, roundNumber, false);
      sceneData = {
        scene: fallback.scene,
        choices: fallback.choices && fallback.choices.length > 0 ? fallback.choices : GENERIC_CHOICES,
        state_delta: fallback.stateDelta,
      };
    }

    const roundId = uuid();
    db.createRound({
      id: roundId,
      session_id: sessionId,
      round_number: roundNumber,
      round_type: 'choice',
      pov,
      beat_kind: 'solo',
      scene_text: sceneData.scene,
      choices_json: sceneData.choices ? JSON.stringify(sceneData.choices) : null,
      write_prompt: null,
      state_before: JSON.stringify(currentState),
      is_fallback: isFallback,
    });

    // Solo lanes still nudge the shared mood meter, halved so two lanes
    // don't double-count the swing.
    const halvedDelta = Object.fromEntries(
      Object.entries(sceneData.state_delta).map(([k, v]) => [k, Math.round((v as number) / 2)]),
    );
    const newState = applyDelta(currentState, halvedDelta);
    db.updateSessionGameState(sessionId, JSON.stringify(newState));
    db.updateRoundStateAfter(roundId, JSON.stringify(newState));
    db.updatePlayerCurrentRound(playerId, roundNumber);
    this.refreshHistorySummaryIfNeeded(sessionId, session.total_rounds);

    return {
      roundId,
      roundNumber,
      totalRounds: session.total_rounds,
      roundType: 'choice',
      beatKind: 'solo',
      sceneText: sceneData.scene,
      choices: sceneData.choices,
    };
  }

  /**
   * Long stories (12/20 rounds) can't feed every past round into every
   * prompt. Past a certain length, collapse everything except the most
   * recent 3 rounds into one compressed summary line, cached on the
   * session row and rebuilt after every round. Short (6-round) stories
   * are untouched — full verbatim history, exactly as before.
   */
  private refreshHistorySummaryIfNeeded(sessionId: string, totalRounds: number) {
    if (totalRounds <= 6) return;
    const rounds = db.getRounds(sessionId);
    if (rounds.length <= 3) return;

    const older = rounds.slice(0, -3);
    const summary = summarizeRoundsDeterministic(older.map((r: any) => {
      const choices = db.getChoicesForRound(r.id);
      return {
        round: r.round_number,
        scene: r.scene_text,
        playerAChoice: choices[0]?.choice_text || '',
        playerBChoice: choices[1]?.choice_text || '',
      };
    }));
    db.updateSessionHistorySummary(sessionId, summary);
  }

  private buildSharedHistory(sessionId: string, upToRoundNumber: number, totalRounds: number = 6, storedSummary: string = '') {
    const rounds = db.getRounds(sessionId).filter((r: any) => r.round_number < upToRoundNumber);
    const verbatim = (rs: any[]) => rs.map((r: any) => {
      const choices = db.getChoicesForRound(r.id);
      return {
        round: r.round_number,
        scene: r.scene_text,
        playerAChoice: choices[0]?.choice_text || '',
        playerBChoice: choices[1]?.choice_text || '',
      };
    });

    if (totalRounds <= 6 || rounds.length <= 3) {
      return verbatim(rounds);
    }

    const recent = verbatim(rounds.slice(-3));
    if (storedSummary) {
      recent.unshift({ round: 0, scene: `[Earlier in the story]: ${storedSummary}`, playerAChoice: '', playerBChoice: '' });
    }
    return recent;
  }

  private buildSoloHistory(sessionId: string, pov: 'a' | 'b', upToRoundNumber: number, totalRounds: number = 6, storedSummary: string = '') {
    const all = db.getRounds(sessionId);
    const relevant = all.filter((r: any) =>
      r.round_number < upToRoundNumber && (r.pov === 'shared' || r.pov === pov),
    );
    const verbatim = (rs: any[]) => rs.map((r: any) => {
      const choices = db.getChoicesForRound(r.id);
      const mine = choices[0]?.choice_text || '';
      return {
        round: r.round_number,
        scene: r.scene_text,
        playerAChoice: mine,
        playerBChoice: '',
      };
    });

    if (totalRounds <= 6 || relevant.length <= 3) {
      return verbatim(relevant);
    }

    const recent = verbatim(relevant.slice(-3));
    if (storedSummary) {
      recent.unshift({ round: 0, scene: `[Earlier in your path]: ${storedSummary}`, playerAChoice: '', playerBChoice: '' });
    }
    return recent;
  }

  /**
   * Submit a player's choice for a round. For shared/convergence rounds this
   * needs both players; for solo rounds it's complete the instant they submit.
   */
  submitChoice(roundId: string, playerId: string, choiceText: string): {
    complete: boolean;
    isModerated: boolean;
    pov: string;
  } {
    const round = db.getRound(roundId);
    let finalText = choiceText;
    let isModerated = 0;

    if (round.round_type === 'write') {
      const result = moderateText(choiceText);
      finalText = result.cleaned;
      isModerated = result.safe ? 0 : 1;
    }

    db.saveChoice({
      id: uuid(),
      round_id: roundId,
      player_id: playerId,
      choice_text: finalText,
      is_moderated: isModerated,
    });

    const choices = db.getChoicesForRound(roundId);
    const complete = round.pov === 'shared' ? choices.length >= 2 : choices.length >= 1;

    return { complete, isModerated: isModerated === 1, pov: round.pov };
  }

  /**
   * Generate the round reveal payload for a shared/convergence round.
   */
  getRoundReveal(roundId: string, requestingPlayerId: string): RoundRevealPayload {
    const round = db.getRound(roundId);
    const choices = db.getChoicesForRound(roundId);

    const myChoice = choices.find((c: any) => c.player_id === requestingPlayerId);
    const theirChoice = choices.find((c: any) => c.player_id !== requestingPlayerId);

    const matched = myChoice?.choice_text === theirChoice?.choice_text;

    return {
      yourChoice: myChoice?.choice_text || '',
      theirChoice: theirChoice?.choice_text || '',
      matched,
      reactionText: randomReaction(matched),
      roundNumber: round.round_number,
    };
  }

  /**
   * Which lane (a/b) a player occupies in a session.
   */
  povOfPlayer(sessionId: string, playerId: string): 'a' | 'b' {
    const players = db.getPlayers(sessionId);
    return povOf(players, playerId);
  }

  /**
   * The solo/convergence round map for this session's actual length.
   */
  getRoundPlan(sessionId: string): RoundPlan {
    const session = db.getSession(sessionId);
    return computeRoundPlan(session.total_rounds);
  }

  /**
   * Whether a lane (a/b) has actually submitted its last solo-round choice.
   */
  laneComplete(sessionId: string, pov: 'a' | 'b'): boolean {
    const plan = this.getRoundPlan(sessionId);
    const lastSolo = plan.soloRounds[plan.soloRounds.length - 1];
    if (lastSolo === undefined) return true;
    const round = db.getRoundBySessionAndNumber(sessionId, lastSolo, pov);
    if (!round) return false;
    return db.getChoicesForRound(round.id).length >= 1;
  }

  /**
   * Check if the game is over after this round.
   */
  isGameOver(sessionId: string, roundNumber: number): boolean {
    const session = db.getSession(sessionId);
    return roundNumber >= session.total_rounds;
  }

  /**
   * Generate the final session results, including both players' full lanes
   * so each side gets an accurate, non-inverted transcript of their own
   * choices vs. the other lead's — and the big reveal of what happened in
   * the solo rounds they never saw.
   */
  async generateResults(sessionId: string): Promise<SessionCompletePayload & { transcriptFor: (playerId: string) => TranscriptItem[] }> {
    const session = db.getSession(sessionId);
    const scenario = resolveScenario(session.scenario_id)!;
    const players = db.getPlayers(sessionId);
    const rounds = db.getRounds(sessionId);

    const playerA = players[0];
    const playerB = players[1];

    let matchCount = 0;
    let clashCount = 0;

    // roundNumber -> { a: {scene, choice}, b: {scene, choice}, beatKind, matched }
    const laneMap = new Map<number, {
      beatKind: 'shared' | 'solo' | 'convergence';
      a: { scene: string; choice: string };
      b: { scene: string; choice: string };
      matched: boolean | null;
    }>();

    for (const round of rounds) {
      const choices = db.getChoicesForRound(round.id);
      const entry = laneMap.get(round.round_number) || {
        beatKind: round.beat_kind,
        a: { scene: '', choice: '' },
        b: { scene: '', choice: '' },
        matched: null as boolean | null,
      };

      if (round.pov === 'shared') {
        const choiceA = choices.find((c: any) => c.player_id === playerA.id);
        const choiceB = choices.find((c: any) => c.player_id === playerB.id);
        const matched = choiceA?.choice_text === choiceB?.choice_text;
        entry.a = { scene: round.scene_text, choice: choiceA?.choice_text || '' };
        entry.b = { scene: round.scene_text, choice: choiceB?.choice_text || '' };
        entry.matched = matched;
        if (matched) matchCount++; else clashCount++;
      } else if (round.pov === 'a') {
        entry.a = { scene: round.scene_text, choice: choices[0]?.choice_text || '' };
        entry.matched = null;
      } else if (round.pov === 'b') {
        entry.b = { scene: round.scene_text, choice: choices[0]?.choice_text || '' };
        entry.matched = null;
      }

      laneMap.set(round.round_number, entry);
    }

    const orderedRoundNumbers = Array.from(laneMap.keys()).sort((x, y) => x - y);

    const buildFor = (viewerIsA: boolean): TranscriptItem[] => {
      return orderedRoundNumbers.map((rn) => {
        const lane = laneMap.get(rn)!;
        const mine = viewerIsA ? lane.a : lane.b;
        const theirs = viewerIsA ? lane.b : lane.a;
        return {
          roundNumber: rn,
          beatKind: lane.beatKind,
          yourScene: mine.scene,
          yourChoice: mine.choice,
          theirScene: theirs.scene || undefined,
          theirChoice: theirs.choice || undefined,
          matched: lane.matched,
        };
      });
    };

    let analysis = await generateFinalAnalysis({
      transcript: orderedRoundNumbers.map((rn) => {
        const lane = laneMap.get(rn)!;
        return { round: rn, scene: lane.a.scene || lane.b.scene, playerAChoice: lane.a.choice, playerBChoice: lane.b.choice };
      }),
      playerAName: playerA.display_name,
      playerBName: playerB.display_name,
      playerAObjective: playerA.secret_objective,
      playerBObjective: playerB.secret_objective,
      matchCount,
      clashCount,
    });

    if (!analysis) {
      analysis = fallbackAnalysis(matchCount, clashCount, session.total_rounds);
    }

    db.saveResult({
      id: uuid(),
      session_id: sessionId,
      chemistry_score: analysis.chemistry_score,
      insight_text: analysis.insight,
      dimension_breakdown: JSON.stringify(analysis.breakdown),
      match_count: matchCount,
      clash_count: clashCount,
    });

    db.updateSessionStatus(sessionId, 'completed');
    db.trackEvent('completed', sessionId);

    const base = {
      storyTitle: scenario.title,
      transcript: buildFor(true),
      matchCount,
      clashCount,
      objectives: {
        yours: playerA.secret_objective,
        theirs: playerB.secret_objective,
      },
      chemistryScore: analysis.chemistry_score,
      insight: analysis.insight,
      breakdown: analysis.breakdown,
      partnerIsAI: playerB.is_ai === 1,
      partnerName: playerB.display_name,
      sessionId,
    };

    return {
      ...base,
      transcriptFor: (playerId: string) => (playerId === playerA.id ? buildFor(true) : buildFor(false)),
    };
  }

  /**
   * Handle AI player's automatic choice submission.
   */
  scheduleAIChoice(
    roundId: string,
    aiPlayerId: string,
    choices: string[] | undefined,
    writePrompt: string | undefined,
    genre: string,
    gameState: GameState,
    onComplete: () => void,
  ) {
    const delay = getAIDelay();

    setTimeout(() => {
      let choiceText: string;

      if (writePrompt || !choices || choices.length === 0) {
        choiceText = pickAIWriteResponse(genre);
      } else {
        choiceText = pickAIChoice(choices, gameState);
      }

      this.submitChoice(roundId, aiPlayerId, choiceText);
      onComplete();
    }, delay);
  }

  /**
   * Record a human/AI guess made by `guessingPlayerId` about their partner.
   */
  recordGuess(sessionId: string, guessingPlayerId: string, guess: 'human' | 'ai'): { correct: boolean; partnerIsAI: boolean; explanation: string } {
    const players = db.getPlayers(sessionId);
    const partner = players.find((p: any) => p.id !== guessingPlayerId);
    const partnerIsAI = partner?.is_ai === 1;

    const correct = (guess === 'ai' && partnerIsAI) || (guess === 'human' && !partnerIsAI);

    db.updateGuess(sessionId, guess, correct ? 1 : 0);

    let explanation: string;
    if (correct) {
      explanation = partnerIsAI
        ? "You caught the AI. Their choices were a bit too consistent."
        : "You could tell a real person was behind those choices.";
    } else {
      explanation = partnerIsAI
        ? "The AI was trying very hard to act human. It almost worked."
        : "Real humans can be unpredictable too.";
    }

    return { correct, partnerIsAI, explanation };
  }
}

export const gameManager = new GameManager();
