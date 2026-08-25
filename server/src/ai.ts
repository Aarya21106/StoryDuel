import { GoogleGenAI } from '@google/genai';
import type { AIRoundResponse, AIAnalysisResponse, GameState } from './types.js';

const apiKey = process.env.GEMINI_API_KEY;
let genai: GoogleGenAI | null = null;

if (apiKey) {
  genai = new GoogleGenAI({ apiKey });
}

// ── Round Scene Generation ──

export async function generateRoundScene(params: {
  scenarioTitle: string;
  seed: { location: string; incident: string; tone: string; object: string };
  currentState: GameState;
  history: { round: number; scene: string; playerAChoice: string; playerBChoice: string }[];
  roundNumber: number;
  roundType: 'choice' | 'write';
}): Promise<AIRoundResponse | null> {
  if (!genai) return null;

  const prompt = `You are the story engine for StoryDuel, a game where two players make secret choices that shape a shared story.

SCENARIO: ${params.scenarioTitle}
SEED: Location: ${params.seed.location}, Incident: ${params.seed.incident}, Tone: ${params.seed.tone}, Object: ${params.seed.object}
CURRENT STATE: danger=${params.currentState.danger}, trust=${params.currentState.trust}, mystery=${params.currentState.mystery}, chaos=${params.currentState.chaos}
ROUND: ${params.roundNumber} of 6
ROUND TYPE: ${params.roundType}
HISTORY:
${JSON.stringify(params.history)}

RULES:
- Write 1-2 sentences of scene text. Present tense, second person ("You see...").
- Use natural Indian Gen-Z English. Short. Punchy. No literary prose.
- The scene MUST react to BOTH players' previous choices.
- If danger > 70, make things feel threatening.
- If trust > 70, make things feel safe and honest.
- If mystery > 70, add something unexplained.
- If chaos > 70, make something unpredictable happen.
${params.roundType === 'choice' ? '- Provide exactly 3 short choices (max 6 words each). Each should feel like a real decision.' : '- Provide a short write_prompt (max 8 words) that asks the player to respond in character.'}

OUTPUT (strict JSON only, no markdown, no code fences):
${params.roundType === 'choice'
    ? '{ "scene": "...", "choices": ["...", "...", "..."], "state_delta": { "danger": N, "trust": N, "mystery": N, "chaos": N } }'
    : '{ "scene": "...", "write_prompt": "...", "state_delta": { "danger": N, "trust": N, "mystery": N, "chaos": N } }'}

state_delta values must be integers between -15 and +15.`;

  try {
    const response = await Promise.race([
      genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
          maxOutputTokens: 300,
        },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
    ]);

    const text = response.text?.trim();
    if (!text) return null;

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AIRoundResponse;

    // Validate
    if (!parsed.scene || typeof parsed.scene !== 'string') return null;
    if (params.roundType === 'choice') {
      if (!Array.isArray(parsed.choices) || parsed.choices.length < 2) return null;
    }
    if (!parsed.state_delta) return null;

    // Clamp deltas
    for (const key of ['danger', 'trust', 'mystery', 'chaos'] as const) {
      parsed.state_delta[key] = Math.max(-15, Math.min(15, Math.round(parsed.state_delta[key] || 0)));
    }

    return parsed;
  } catch (e) {
    console.error('[AI] Scene generation failed:', (e as Error).message);
    return null;
  }
}

// ── Final Analysis ──

export async function generateFinalAnalysis(params: {
  transcript: { round: number; scene: string; playerAChoice: string; playerBChoice: string }[];
  playerAName: string;
  playerBName: string;
  playerAObjective: string;
  playerBObjective: string;
  matchCount: number;
  clashCount: number;
}): Promise<AIAnalysisResponse | null> {
  if (!genai) return null;

  const prompt = `Analyze this StoryDuel game transcript and generate a result.

TRANSCRIPT: ${JSON.stringify(params.transcript)}
PLAYER A: ${params.playerAName}, objective: "${params.playerAObjective}"
PLAYER B: ${params.playerBName}, objective: "${params.playerBObjective}"
MATCHES: ${params.matchCount}, CLASHES: ${params.clashCount}

Generate:
1. chemistry_score (0-100): How well their choices complemented each other. More matches = higher. But interesting clashes also add points.
2. insight (one sentence, natural Indian Gen-Z English): MUST reference SPECIFIC choices they made. Never generic.
3. breakdown: { sync: 0-100, risk: 0-100, trust: 0-100, direction: 0-100 }

BAD insight: "You both have amazing creativity!"
GOOD insight: "You kept choosing the risky option, but both of you protected the stranger when it actually mattered."

OUTPUT (strict JSON only, no markdown, no code fences):
{ "chemistry_score": N, "insight": "...", "breakdown": { "sync": N, "risk": N, "trust": N, "direction": N } }`;

  try {
    const response = await Promise.race([
      genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
    ]);

    const text = response.text?.trim();
    if (!text) return null;

    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as AIAnalysisResponse;

    if (typeof parsed.chemistry_score !== 'number' || !parsed.insight || !parsed.breakdown) return null;

    parsed.chemistry_score = Math.max(0, Math.min(100, Math.round(parsed.chemistry_score)));

    return parsed;
  } catch (e) {
    console.error('[AI] Analysis generation failed:', (e as Error).message);
    return null;
  }
}

// ── Deterministic Fallback Analysis ──

export function fallbackAnalysis(matchCount: number, clashCount: number, totalRounds: number): AIAnalysisResponse {
  const matchRatio = matchCount / Math.max(totalRounds, 1);
  const score = Math.round(30 + matchRatio * 50 + Math.random() * 20);

  const insights = [
    "You both went for chaos when it mattered least — and played it safe when it mattered most.",
    "One of you kept choosing danger. The other kept trying to fix it. Classic duo energy.",
    "You agreed on the weird stuff and disagreed on the obvious stuff. Make of that what you will.",
    "You both avoided the safe option almost every time. Respect.",
    "One of you was trying to save everyone. The other was trying to burn it all down. Somehow it worked.",
    "You both picked the emotional option at the exact same moment. That's not a coincidence.",
    "Neither of you trusted the stranger — but you trusted each other's instincts without knowing it.",
    "You kept choosing the unexpected option. Both of you. Every single time.",
  ];

  return {
    chemistry_score: Math.max(15, Math.min(95, score)),
    insight: insights[Math.floor(Math.random() * insights.length)],
    breakdown: {
      sync: Math.round(matchRatio * 80 + Math.random() * 20),
      risk: Math.round(40 + Math.random() * 50),
      trust: Math.round(30 + matchRatio * 40 + Math.random() * 20),
      direction: Math.round(35 + Math.random() * 50),
    },
  };
}
