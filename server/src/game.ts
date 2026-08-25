import { v4 as uuid } from 'uuid';
import * as db from './db.js';
import { pickScenario, generateSeed, pickObjectives, pickWriteRound } from './scenarios.js';
import { getFallbackBeat } from './fallbacks.js';
import { generateRoundScene, generateFinalAnalysis, fallbackAnalysis } from './ai.js';
import { pickAIChoice, pickAIWriteResponse, getAIDelay } from './aiPlayer.js';
import { moderateText } from './moderation.js';
import type { GameState, AIRoundResponse, RoundStartPayload, RoundRevealPayload, SessionCompletePayload } from './types.js';

const TOTAL_ROUNDS = 6;

// ── Match Reaction Phrases ──

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

// ── GameManager ──

export class GameManager {

  /**
   * Create a new game session (stranger or friend mode).
   */
  createSession(mode: 'stranger' | 'friend'): {
    sessionId: string;
    inviteCode: string | null;
    scenario: { id: string; title: string; genre: string; opening: string };
    seed: ReturnType<typeof generateSeed>;
    writeRound: number;
    objectives: [string, string];
    initialState: GameState;
  } {
    const sessionId = uuid();
    const scenario = pickScenario();
    const seed = generateSeed();
    const writeRound = pickWriteRound();
    const objectives = pickObjectives(scenario.genre);
    const inviteCode = mode === 'friend' ? generateInviteCode() : null;

    db.createSession({
      id: sessionId,
      invite_code: inviteCode,
      mode,
      scenario_id: scenario.id,
      scenario_seed: JSON.stringify(seed),
      write_round: writeRound,
      game_state: JSON.stringify(scenario.initialState),
    });

    return {
      sessionId,
      inviteCode,
      scenario: { id: scenario.id, title: scenario.title, genre: scenario.genre, opening: scenario.opening },
      seed,
      writeRound,
      objectives,
      initialState: scenario.initialState,
    };
  }

  /**
   * Add a player to a session.
   */
  addPlayer(sessionId: string, displayName: string, isAI: boolean, objective: string, socketId: string | null): string {
    const playerId = uuid();
    db.createPlayer({
      id: playerId,
      session_id: sessionId,
      display_name: displayName,
      is_ai: isAI ? 1 : 0,
      secret_objective: objective,
      socket_id: socketId,
    });
    return playerId;
  }

  /**
   * Start the game — activate session and generate the first round.
   */
  async startGame(sessionId: string): Promise<RoundStartPayload> {
    db.updateSessionStatus(sessionId, 'active');
    db.trackEvent('started', sessionId);
    return this.generateNextRound(sessionId, 1);
  }

  /**
   * Generate the next round's scene and choices.
   */
  async generateNextRound(sessionId: string, roundNumber: number): Promise<RoundStartPayload> {
    const session = db.getSession(sessionId);
    const currentState: GameState = JSON.parse(session.game_state);
    const seed = JSON.parse(session.scenario_seed);
    const isWriteRound = roundNumber === session.write_round;
    const roundType = isWriteRound ? 'write' : 'choice';

    // Build history from previous rounds
    const rounds = db.getRounds(sessionId);
    const history = rounds.map((r: any) => {
      const choices = db.getChoicesForRound(r.id);
      return {
        round: r.round_number,
        scene: r.scene_text,
        playerAChoice: choices[0]?.choice_text || '',
        playerBChoice: choices[1]?.choice_text || '',
      };
    });

    // Get scenario for title
    const scenario = pickScenario([]).id === session.scenario_id
      ? pickScenario([])
      : { title: session.scenario_id, id: session.scenario_id };

    let sceneData: AIRoundResponse | null = null;

    // For round 1, use the scenario opening
    if (roundNumber === 1) {
      const scenarioData = (await import('./scenarios.js')).SCENARIOS.find(s => s.id === session.scenario_id);
      const opening = scenarioData?.opening || 'Something strange is happening.';
      const fallback = getFallbackBeat(session.scenario_id, 1, isWriteRound);

      sceneData = {
        scene: opening,
        choices: isWriteRound ? undefined : fallback.choices,
        write_prompt: isWriteRound ? fallback.writePrompt : undefined,
        state_delta: { danger: 0, trust: 0, mystery: 0, chaos: 0 },
      };
    } else {
      // Try AI generation
      sceneData = await generateRoundScene({
        scenarioTitle: session.scenario_id,
        seed,
        currentState,
        history,
        roundNumber,
        roundType,
      });

      // Retry once on failure
      if (!sceneData) {
        sceneData = await generateRoundScene({
          scenarioTitle: session.scenario_id,
          seed,
          currentState,
          history,
          roundNumber,
          roundType,
        });
      }
    }

    // Final fallback
    let isFallback = 0;
    if (!sceneData) {
      isFallback = 1;
      const fallback = getFallbackBeat(session.scenario_id, roundNumber, isWriteRound);
      sceneData = {
        scene: fallback.scene,
        choices: isWriteRound ? undefined : fallback.choices,
        write_prompt: isWriteRound ? fallback.writePrompt : undefined,
        state_delta: fallback.stateDelta,
      };
    }

    // Save round
    const roundId = uuid();
    db.createRound({
      id: roundId,
      session_id: sessionId,
      round_number: roundNumber,
      round_type: roundType,
      scene_text: sceneData.scene,
      choices_json: sceneData.choices ? JSON.stringify(sceneData.choices) : null,
      write_prompt: sceneData.write_prompt || null,
      state_before: JSON.stringify(currentState),
      is_fallback: isFallback,
    });

    // Apply state delta
    const newState = applyDelta(currentState, sceneData.state_delta);
    db.updateSessionGameState(sessionId, JSON.stringify(newState));
    db.updateRoundStateAfter(roundId, JSON.stringify(newState));
    db.updateSessionRound(sessionId, roundNumber);

    return {
      roundId,
      roundNumber,
      totalRounds: TOTAL_ROUNDS,
      roundType,
      sceneText: sceneData.scene,
      choices: sceneData.choices,
      writePrompt: sceneData.write_prompt,
    };
  }

  /**
   * Submit a player's choice for a round.
   * Returns true if both players have now submitted.
   */
  submitChoice(roundId: string, playerId: string, choiceText: string): {
    bothSubmitted: boolean;
    isModerated: boolean;
  } {
    const round = db.getRound(roundId);
    let finalText = choiceText;
    let isModerated = 0;

    // Moderate write round text
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
    return {
      bothSubmitted: choices.length >= 2,
      isModerated: isModerated === 1,
    };
  }

  /**
   * Generate the round reveal payload.
   */
  getRoundReveal(roundId: string, requestingPlayerId: string): RoundRevealPayload {
    const round = db.getRound(roundId);
    const choices = db.getChoicesForRound(roundId);
    const players = db.getPlayers(round.session_id);

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
   * Check if the game is over after this round.
   */
  isGameOver(roundNumber: number): boolean {
    return roundNumber >= TOTAL_ROUNDS;
  }

  /**
   * Generate the final session results.
   */
  async generateResults(sessionId: string): Promise<SessionCompletePayload> {
    const session = db.getSession(sessionId);
    const players = db.getPlayers(sessionId);
    const rounds = db.getRounds(sessionId);

    const playerA = players[0];
    const playerB = players[1];

    // Build transcript
    let matchCount = 0;
    let clashCount = 0;
    const transcript: SessionCompletePayload['transcript'] = [];

    for (const round of rounds) {
      const choices = db.getChoicesForRound(round.id);
      const choiceA = choices.find((c: any) => c.player_id === playerA.id);
      const choiceB = choices.find((c: any) => c.player_id === playerB.id);
      const matched = choiceA?.choice_text === choiceB?.choice_text;

      if (matched) matchCount++;
      else clashCount++;

      transcript.push({
        roundNumber: round.round_number,
        scene: round.scene_text,
        yourChoice: choiceA?.choice_text || '',
        theirChoice: choiceB?.choice_text || '',
        matched,
      });
    }

    // Generate AI analysis
    let analysis = await generateFinalAnalysis({
      transcript: transcript.map(t => ({
        round: t.roundNumber,
        scene: t.scene,
        playerAChoice: t.yourChoice,
        playerBChoice: t.theirChoice,
      })),
      playerAName: playerA.display_name,
      playerBName: playerB.display_name,
      playerAObjective: playerA.secret_objective,
      playerBObjective: playerB.secret_objective,
      matchCount,
      clashCount,
    });

    // Fallback if AI analysis fails
    if (!analysis) {
      analysis = fallbackAnalysis(matchCount, clashCount, TOTAL_ROUNDS);
    }

    // Save results
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

    return {
      transcript,
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
   * Record a human/AI guess.
   */
  recordGuess(sessionId: string, guess: 'human' | 'ai'): { correct: boolean; partnerIsAI: boolean; explanation: string } {
    const players = db.getPlayers(sessionId);
    const partner = players.find((p: any) => p.is_ai !== undefined);
    const partnerIsAI = players.some((p: any) => p.is_ai === 1);

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
