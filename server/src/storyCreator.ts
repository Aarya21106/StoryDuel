import { v4 as uuid } from 'uuid';
import { moderatePrompt } from './moderation.js';
import { generateCustomStorySeed, type GeneratedStorySeed } from './ai.js';
import { generateSeed, isValidLengthRounds } from './scenarios.js';
import * as db from './db.js';
import type { GameState, Scenario } from './types.js';

const GENERIC_STATE_BY_GENRE: Record<string, GameState> = {
  mystery: { danger: 30, trust: 20, mystery: 65, chaos: 15 },
  horror: { danger: 55, trust: 10, mystery: 50, chaos: 20 },
  romance: { danger: 5, trust: 35, mystery: 20, chaos: 10 },
  adventure: { danger: 25, trust: 20, mystery: 45, chaos: 20 },
  emotional: { danger: 5, trust: 35, mystery: 20, chaos: 5 },
  comedy: { danger: 10, trust: 25, mystery: 15, chaos: 55 },
  scifi: { danger: 55, trust: 15, mystery: 45, chaos: 30 },
  chaos: { danger: 30, trust: 15, mystery: 40, chaos: 55 },
};

const GENERIC_CAST_NAMES = [
  ['You', 'the one who\'s in the middle of it'],
  ['The other lead', 'someone who knows more than they\'re saying'],
];

function titleFromPrompt(prompt: string): string {
  const firstSentence = prompt.split(/[.!?\n]/)[0].trim();
  const words = firstSentence.split(/\s+/).slice(0, 5).join(' ');
  const title = words.charAt(0).toUpperCase() + words.slice(1);
  return title.length > 3 ? title : 'A New Story';
}

/**
 * Deterministic seed builder used when AI generation is unavailable or
 * fails — creation must never hard-fail, same principle as the round
 * engine's own fallback content.
 */
function buildFallbackSeed(prompt: string, genre: string): GeneratedStorySeed {
  const flavor = generateSeed();
  const title = titleFromPrompt(prompt);
  return {
    title,
    logline: prompt.length > 120 ? prompt.slice(0, 117) + '…' : prompt,
    synopsis: `${prompt} The story opens at ${flavor.location}, where ${flavor.incident}.`,
    opening: `You're at ${flavor.location}. Then, ${flavor.incident}.`,
    toneTags: [flavor.tone, genre, 'unfolding'],
    castA: { name: GENERIC_CAST_NAMES[0][0], role: GENERIC_CAST_NAMES[0][1], want: 'to make sense of what\'s happening' },
    castB: { name: GENERIC_CAST_NAMES[1][0], role: GENERIC_CAST_NAMES[1][1], want: 'to see how this plays out' },
    seedFlavor: flavor,
    initialState: GENERIC_STATE_BY_GENRE[genre] || GENERIC_STATE_BY_GENRE.mystery,
  };
}

export interface CreateStoryResult {
  ok: boolean;
  error?: string;
  story?: { id: string; title: string; genre: string; lengthRounds: number };
}

export async function createCustomStory(params: {
  authorUserId: string;
  prompt: string;
  genre: Scenario['genre'];
  lengthRounds: number;
}): Promise<CreateStoryResult> {
  const { authorUserId, genre } = params;
  const prompt = params.prompt.trim();

  if (!isValidLengthRounds(params.lengthRounds)) {
    return { ok: false, error: 'Invalid story length' };
  }

  const modResult = moderatePrompt(prompt);
  if (!modResult.safe) {
    return { ok: false, error: modResult.reason || 'That prompt was blocked by moderation.' };
  }

  let seed = await generateCustomStorySeed(prompt, genre);
  let isFallbackSeed = false;

  if (!seed) {
    seed = await generateCustomStorySeed(prompt, genre);
  }
  if (!seed) {
    seed = buildFallbackSeed(prompt, genre);
    isFallbackSeed = true;
  }

  const storyId = uuid();
  db.createStory({
    id: storyId,
    author_user_id: authorUserId,
    title: seed.title,
    genre,
    prompt,
    seed_json: JSON.stringify(seed),
    length_rounds: params.lengthRounds,
    is_fallback_seed: isFallbackSeed,
  });

  return {
    ok: true,
    story: { id: storyId, title: seed.title, genre, lengthRounds: params.lengthRounds },
  };
}
