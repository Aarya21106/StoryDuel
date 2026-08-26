// ── Text Moderation ──
// Simple regex-based moderation + optional AI safety check

const BLOCKED_PATTERNS = [
  /\b(fuck|shit|bitch|ass|dick|pussy|cock|cunt|nigger|faggot|retard)\b/gi,
  /\b(kill\s+(?:you|your|myself|herself|himself|themselves))\b/gi,
  /\b(suicide|self.?harm|rape)\b/gi,
  /\b(bomb|terror|shoot|attack)\b/gi,
];

const REPLACEMENT = "I'm not sure what to say.";

export function moderateText(text: string, maxLength: number = 150): { safe: boolean; cleaned: string } {
  if (!text || text.trim().length === 0) {
    return { safe: true, cleaned: '' };
  }

  const trimmed = text.trim();

  // Strip HTML
  const noHtml = trimmed.replace(/<[^>]*>/g, '');

  // Check against blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(noHtml)) {
      return { safe: false, cleaned: REPLACEMENT };
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  // Length check
  if (noHtml.length > maxLength) {
    return { safe: true, cleaned: noHtml.substring(0, maxLength) };
  }

  return { safe: true, cleaned: noHtml };
}

/**
 * Moderation for longer, freeform text (a story-creation prompt, not a
 * single in-round line). Same blocked-pattern check, a generous length
 * cap, and — unlike moderateText — a blocked prompt is rejected outright
 * rather than swapped for a placeholder, since it's never shown to
 * another player and should just fail the creation request.
 */
export function moderatePrompt(text: string): { safe: boolean; cleaned: string; reason?: string } {
  if (!text || text.trim().length < 10) {
    return { safe: false, cleaned: '', reason: 'Tell us a bit more about the story you want.' };
  }
  const result = moderateText(text, 600);
  if (!result.safe) {
    return { safe: false, cleaned: '', reason: "That prompt didn't pass our content check. Try rephrasing it." };
  }
  return result;
}
