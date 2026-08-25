import { getResult, getPlayers, getSession } from './db.js';

/**
 * Generate an SVG share card for a completed game session.
 */
export function generateShareCard(sessionId: string): string | null {
  const result = getResult(sessionId);
  if (!result) return null;

  const session = getSession(sessionId);
  const players = getPlayers(sessionId);
  if (!players || players.length < 2) return null;

  const playerA = players[0];
  const playerB = players[1];
  const score = result.chemistry_score;
  const insight = result.insight_text;

  // Truncate insight to fit card
  const maxInsightLen = 120;
  const displayInsight = insight.length > maxInsightLen
    ? insight.substring(0, maxInsightLen - 3) + '...'
    : insight;

  // Escape XML special characters
  const esc = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Wrap text into lines
  const wrapText = (text: string, maxChars: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        if (current) lines.push(current.trim());
        current = word;
      } else {
        current += ' ' + word;
      }
    }
    if (current.trim()) lines.push(current.trim());
    return lines;
  };

  const insightLines = wrapText(displayInsight, 38);
  const insightSvg = insightLines.map((line, i) =>
    `<text x="200" y="${340 + i * 22}" font-family="'Outfit', sans-serif" font-size="14" fill="#9C9689" text-anchor="middle">"${esc(line)}"</text>`
  ).join('\n    ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F0E0E"/>
      <stop offset="100%" style="stop-color:#1A1917"/>
    </linearGradient>
    <linearGradient id="scoreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B4A"/>
      <stop offset="100%" style="stop-color:#A78BFA"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="560" rx="20" fill="url(#bg)"/>
  <rect width="400" height="560" rx="20" fill="#F5F0E8" opacity="0.02"/>

  <!-- Border -->
  <rect x="1" y="1" width="398" height="558" rx="19" fill="none" stroke="#252320" stroke-width="1"/>

  <!-- Logo -->
  <text x="200" y="50" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="16" fill="#FF6B4A" text-anchor="middle" letter-spacing="4">STORYDUEL</text>

  <!-- Title -->
  <text x="200" y="100" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="18" fill="#F5F0E8" text-anchor="middle">WE CREATED A STORY</text>
  <text x="200" y="126" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="18" fill="#F5F0E8" text-anchor="middle">WITHOUT TALKING.</text>

  <!-- Divider -->
  <line x1="160" y1="150" x2="240" y2="150" stroke="#252320" stroke-width="1"/>

  <!-- Score -->
  <text x="200" y="220" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="72" fill="url(#scoreGlow)" text-anchor="middle">${score}%</text>
  <text x="200" y="250" font-family="'Outfit', sans-serif" font-weight="400" font-size="14" fill="#9C9689" text-anchor="middle" letter-spacing="3">STORY CHEMISTRY</text>

  <!-- Divider -->
  <line x1="140" y1="280" x2="260" y2="280" stroke="#252320" stroke-width="1"/>

  <!-- Insight -->
  <text x="200" y="310" font-family="'Outfit', sans-serif" font-size="11" fill="#F5C542" text-anchor="middle" letter-spacing="1">THE VERDICT</text>
    ${insightSvg}

  <!-- Stats -->
  <text x="200" y="${350 + insightLines.length * 22 + 20}" font-family="'JetBrains Mono', monospace" font-size="12" fill="#4AEADC" text-anchor="middle">6 rounds · 1 story · 2 minds</text>

  <!-- Names -->
  <text x="200" y="${350 + insightLines.length * 22 + 60}" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="20" fill="#F5F0E8" text-anchor="middle">${esc(playerA.display_name)} × ${esc(playerB.display_name)}</text>

  <!-- CTA -->
  <rect x="100" y="${Math.min(350 + insightLines.length * 22 + 85, 480)}" width="200" height="36" rx="18" fill="#FF6B4A" opacity="0.15"/>
  <text x="200" y="${Math.min(350 + insightLines.length * 22 + 108, 503)}" font-family="'Outfit', sans-serif" font-weight="500" font-size="13" fill="#FF6B4A" text-anchor="middle">Can you beat our score?</text>

  <!-- Footer -->
  <text x="200" y="540" font-family="'Outfit', sans-serif" font-size="10" fill="#9C9689" text-anchor="middle" opacity="0.5">storyduel.app</text>
</svg>`;

  return svg;
}
