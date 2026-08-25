import { GoogleGenAI } from '@google/genai';
import type { AIRoundResponse, AIAnalysisResponse, GameState } from './types.js';

const apiKey = process.env.GEMINI_API_KEY;
let genai: GoogleGenAI | null = null;

if (apiKey) {
  genai = new GoogleGenAI({ apiKey });
}

type BeatKind = 'shared' | 'solo' | 'convergence';

// ── Round / Beat Scene Generation ──

export async function generateRoundScene(params: {
  scenarioTitle: string;
  seed: { location: string; incident: string; tone: string; object: string };
  currentState: GameState;
  history: { round: number; scene: string; playerAChoice: string; playerBChoice: string }[];
  roundNumber: number;
  roundType: 'choice' | 'write';
  beatKind: BeatKind;
  povCharacterName?: string;
  otherCharacterName?: string;
}): Promise<AIRoundResponse | null> {
  if (!genai) return null;

  const povNote = params.beatKind === 'solo'
    ? `POV: You are writing ONLY for ${params.povCharacterName || 'this character'}. They are currently apart from ${params.otherCharacterName || 'the other lead'} — do not mention what the other character is doing, you don't know. This is their own private thread of the story.`
    : params.beatKind === 'convergence'
      ? `POV: ${params.povCharacterName || 'the two leads'} and ${params.otherCharacterName || 'the other lead'} are about to be in the same place again after time apart. Build anticipation for the reunion — do not describe what either of them did while apart, only that they're converging now.`
      : `POV: Shared scene. Both characters are present together.`;

  const prompt = `You are the story engine for StoryDuel — a two-player cinematic fiction game. Write like a tight, contemporary short film script: specific, sensory, unhurried but never padded.

STORY: ${params.scenarioTitle}
SEED DETAILS: Location: ${params.seed.location}, Incident: ${params.seed.incident}, Tone: ${params.seed.tone}, Object: ${params.seed.object}
CURRENT STATE: danger=${params.currentState.danger}, trust=${params.currentState.trust}, mystery=${params.currentState.mystery}, chaos=${params.currentState.chaos}
BEAT: ${params.roundNumber} of 6
${povNote}
HISTORY SO FAR:
${JSON.stringify(params.history)}

RULES:
- Write 2–3 sentences of scene text. Present tense, second person ("You..."). Cinematic and specific — name real sensory details, not vague mood words.
- Natural, grounded contemporary English. No purple prose, no cliché horror-movie phrasing, no exclamation-mark overload.
- The scene must react to what happened just before it in HISTORY.
- If danger > 70, make it feel genuinely threatening. If trust > 70, make it feel intimate and safe. If mystery > 70, leave something specific unexplained. If chaos > 70, let something unpredictable happen.
${params.roundType === 'choice'
    ? '- Provide exactly 3 choices. Each is a full intention, 10–18 words, written as something a real person would actually decide to do — not a short verb phrase. Make the three options feel meaningfully different in risk or tone.'
    : '- Provide a short write_prompt (max 10 words) asking the player to respond in character, in their own words.'}

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
          temperature: 0.85,
          maxOutputTokens: 400,
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

// ── Final Analysis / Credits ──

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

  const prompt = `You are the closing narrator for a two-player interactive story called StoryDuel. The story just ended. Write the closing verdict, like the last line a narrator says before the credits roll.

FULL TRANSCRIPT: ${JSON.stringify(params.transcript)}
CHARACTER A: ${params.playerAName}, secretly driven to: "${params.playerAObjective}"
CHARACTER B: ${params.playerBName}, secretly driven to: "${params.playerBObjective}"
MOMENTS THEY MATCHED: ${params.matchCount}, MOMENTS THEY DIVERGED: ${params.clashCount}

Generate:
1. chemistry_score (0-100): how well their choices wove together into one coherent story. More matches raises it, but a well-timed divergence that still served the story should raise it too — don't just count matches.
2. insight (one or two sentences, natural and specific, written like a closing narration line — not a personality-quiz verdict): MUST reference at least one SPECIFIC choice from the transcript by name.
3. breakdown: { sync: 0-100, risk: 0-100, trust: 0-100, direction: 0-100 }

BAD insight: "You both have amazing creativity!"
GOOD insight: "You kept reaching for the riskier option, and somehow ${params.playerBName} kept ending up exactly where you needed them to be."

OUTPUT (strict JSON only, no markdown, no code fences):
{ "chemistry_score": N, "insight": "...", "breakdown": { "sync": N, "risk": N, "trust": N, "direction": N } }`;

  try {
    const response = await Promise.race([
      genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 260,
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
    "You spent half this story apart, and somehow still ended up wanting the same thing.",
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
