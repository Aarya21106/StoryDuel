import type { GameState } from './types.js';

// ── AI Player Decision Engine ──
// Simulates a human player when no real partner is available.
// Adds realistic delays and weighted decision-making.

// Pre-written write round responses by genre
const WRITE_RESPONSES: Record<string, string[]> = {
  mystery: [
    "I don't think we should be here.",
    "Wait. Did you hear that?",
    "Something about this doesn't add up.",
    "I have a bad feeling about this.",
    "Let's figure this out together.",
    "Who else knows about this place?",
    "We need to find the truth.",
    "This is exactly what they wanted.",
    "Okay, I trust you. Let's go.",
    "None of this is a coincidence.",
  ],
  horror: [
    "Don't. Move.",
    "We need to get out of here. Now.",
    "I think it heard us.",
    "Close the door. Close it now.",
    "Whatever you do, don't look behind you.",
    "This was a mistake.",
    "We're not alone.",
    "I'm not going back in there.",
    "Just stay close to me.",
    "Something is very wrong here.",
  ],
  romance: [
    "I should have said this a long time ago.",
    "You know I never forgot about you, right?",
    "Why didn't you call me back?",
    "I just needed to see you one more time.",
    "Stay. Just for a bit longer.",
    "This feels like a movie. But it's real.",
    "I didn't plan for any of this.",
    "Some things don't need words.",
    "I'm glad you came.",
    "Do you ever think about what could have been?",
  ],
  adventure: [
    "Let's find out what's down there.",
    "I say we go for it.",
    "Whatever happens, we do it together.",
    "This is the best kind of trouble.",
    "Nobody is going to believe this.",
    "We came this far. No turning back.",
    "Hand me that torch.",
    "This is either brilliant or very dumb.",
    "Ready when you are.",
    "I've been waiting for something like this.",
  ],
  emotional: [
    "I'm sorry. For everything.",
    "You deserved better than what I gave you.",
    "I think about this more than I should.",
    "Thank you. For being honest.",
    "I don't know how to say this.",
    "I just needed you to know.",
    "It's okay. I understand.",
    "Sometimes you don't get closure. And that's okay.",
    "I hope you find what you're looking for.",
    "I'll remember this.",
  ],
  comedy: [
    "Okay this is definitely not my fault.",
    "To be fair, this is hilarious.",
    "I can explain. Actually, no I can't.",
    "This is fine. Everything is fine.",
    "You know what? Let's just go with it.",
    "Bro I did NOT sign up for this.",
    "Plot twist: I'm actually enjoying this.",
    "Someone should be recording this.",
    "In my defence, I had no idea.",
    "Quick question: how do I un-become a mayor?",
  ],
  scifi: [
    "The oxygen timer just changed. I think it's wrong.",
    "There's someone else on this station.",
    "Run the diagnostic one more time.",
    "We have four minutes. Make them count.",
    "This doesn't match any protocol I know.",
    "Whatever you do, keep the airlock sealed.",
    "That signal isn't random. It's a pattern.",
    "Trust the data, not the alarm.",
    "We weren't supposed to wake up yet.",
    "If this is it, at least we're not alone.",
  ],
  chaos: [
    "What. Just. Happened.",
    "I don't even know where to begin.",
    "Okay NOW things are getting weird.",
    "Sure. Why not. Let's do this.",
    "I think this suitcase is alive???",
    "This is the strangest Tuesday of my life.",
    "I blame you for all of this.",
    "Is anyone else seeing this?",
    "Cool cool cool cool cool. COOL.",
    "At this point nothing can surprise me.",
  ],
};

/**
 * Pick a weighted choice for the AI player based on the current game state.
 * Higher danger → more cautious picks (lower indices tend to be safer)
 * Higher chaos → more likely to pick unexpected (higher index) options
 */
export function pickAIChoice(choices: string[], gameState: GameState): string {
  if (choices.length === 0) return 'Wait and see';
  if (choices.length === 1) return choices[0];

  const weights: number[] = choices.map((_, i) => {
    let w = 1;
    // Higher danger → favor first (safer) option
    if (gameState.danger > 60 && i === 0) w += 0.5;
    // Higher chaos → favor last (wild) option
    if (gameState.chaos > 60 && i === choices.length - 1) w += 0.5;
    // Higher trust → favor middle options
    if (gameState.trust > 60 && i > 0 && i < choices.length - 1) w += 0.3;
    // Add randomness
    w += Math.random() * 0.8;
    return w;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return choices[i];
  }
  return choices[choices.length - 1];
}

/**
 * Pick a write round response for the AI player.
 */
export function pickAIWriteResponse(genre: string): string {
  const responses = WRITE_RESPONSES[genre] || WRITE_RESPONSES['mystery'];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate a realistic delay for the AI player (in milliseconds).
 * Between 2000ms and 5000ms to feel human.
 */
export function getAIDelay(): number {
  return 2000 + Math.floor(Math.random() * 3000);
}
