// ── StoryDuel Shared Types ──

export interface GameState {
  danger: number;
  trust: number;
  mystery: number;
  chaos: number;
}

export interface ScenarioSeed {
  location: string;
  incident: string;
  tone: string;
  object: string;
}

export interface Scenario {
  id: string;
  title: string;
  genre: 'mystery' | 'horror' | 'romance' | 'adventure' | 'emotional' | 'comedy' | 'scifi' | 'chaos';
  opening: string;
  initialState: GameState;
}

export interface Session {
  id: string;
  invite_code: string | null;
  mode: 'stranger' | 'friend';
  status: 'waiting' | 'active' | 'completed' | 'abandoned';
  scenario_id: string;
  scenario_seed: string | null;
  current_round: number;
  write_round: number;
  game_state: string; // JSON GameState
  created_at: string;
  completed_at: string | null;
}

export interface Player {
  id: string;
  session_id: string;
  display_name: string;
  is_ai: number;
  secret_objective: string;
  socket_id: string | null;
  connected_at: string;
}

export interface Round {
  id: string;
  session_id: string;
  round_number: number;
  round_type: 'choice' | 'write';
  scene_text: string;
  choices_json: string | null;
  write_prompt: string | null;
  state_before: string;
  state_after: string | null;
  is_fallback: number;
  created_at: string;
}

export interface ChoiceMade {
  id: string;
  round_id: string;
  player_id: string;
  choice_text: string;
  is_moderated: number;
  submitted_at: string;
}

export interface Result {
  id: string;
  session_id: string;
  chemistry_score: number;
  insight_text: string;
  dimension_breakdown: string; // JSON
  match_count: number;
  clash_count: number;
  human_ai_guess: string | null;
  human_ai_guess_correct: number | null;
  created_at: string;
}

export interface DimensionBreakdown {
  sync: number;
  risk: number;
  trust: number;
  direction: number;
}

// ── AI Response Schemas ──

export interface AIRoundResponse {
  scene: string;
  choices?: string[];
  write_prompt?: string;
  state_delta: {
    danger: number;
    trust: number;
    mystery: number;
    chaos: number;
  };
}

export interface AIAnalysisResponse {
  chemistry_score: number;
  insight: string;
  breakdown: DimensionBreakdown;
}

// ── Socket Event Payloads ──

export interface MatchFoundPayload {
  sessionId: string;
  playerId: string;
  partnerName: string;
  scenarioTitle: string;
}

export interface ObjectiveAssignedPayload {
  objective: string;
}

export interface RoundStartPayload {
  roundId: string;
  roundNumber: number;
  totalRounds: number;
  roundType: 'choice' | 'write';
  sceneText: string;
  choices?: string[];
  writePrompt?: string;
}

export interface RoundRevealPayload {
  yourChoice: string;
  theirChoice: string;
  matched: boolean;
  reactionText: string;
  roundNumber: number;
}

export interface SessionCompletePayload {
  transcript: {
    roundNumber: number;
    scene: string;
    yourChoice: string;
    theirChoice: string;
    matched: boolean;
  }[];
  matchCount: number;
  clashCount: number;
  objectives: {
    yours: string;
    theirs: string;
  };
  chemistryScore: number;
  insight: string;
  breakdown: DimensionBreakdown;
  partnerIsAI: boolean;
  partnerName: string;
  sessionId: string;
}

export interface GuessResultPayload {
  correct: boolean;
  partnerIsAI: boolean;
  explanation: string;
}

// ── Fallback Beat ──

export interface FallbackBeat {
  scene: string;
  choices: string[];
  writePrompt?: string;
  stateDelta: GameState;
}

export interface SecretObjective {
  text: string;
  genres: Scenario['genre'][];
}
