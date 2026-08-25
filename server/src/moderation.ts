// ── Text Moderation ──
// Simple regex-based moderation + optional AI safety check

const BLOCKED_PATTERNS = [
  /\b(fuck|shit|bitch|ass|dick|pussy|cock|cunt|nigger|faggot|retard)\b/gi,
  /\b(kill\s+(?:you|your|myself|herself|himself|themselves))\b/gi,
  /\b(suicide|self.?harm|rape)\b/gi,
  /\b(bomb|terror|shoot|attack)\b/gi,
];

const REPLACEMENT = "I'm not sure what to say.";

export function moderateText(text: string): { safe: boolean; cleaned: string } {
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
  if (noHtml.length > 150) {
    return { safe: true, cleaned: noHtml.substring(0, 150) };
  }

  return { safe: true, cleaned: noHtml };
}
