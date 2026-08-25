import { getResult, getPlayers, getSession } from './db.js';
import { getScenario } from './scenarios.js';

/**
 * Generate a cinematic SVG share card for a completed game session,
 * color-graded to match the story that was played.
 */
export function generateShareCard(sessionId: string): string | null {
  const result = getResult(sessionId);
  if (!result) return null;

  const session = getSession(sessionId);
  const players = getPlayers(sessionId);
  if (!players || players.length < 2) return null;

  const scenario = getScenario(session.scenario_id);
  const grade = scenario?.grade || { accent: '#C9A24B', accentSoft: 'rgba(201,162,75,0.16)', ink: '#0B0D10', paper: '#EDE6D6' };

  const playerA = players[0];
  const playerB = players[1];
  const score = result.chemistry_score;
  const insight = result.insight_text;

  const maxInsightLen = 130;
  const displayInsight = insight.length > maxInsightLen
    ? insight.substring(0, maxInsightLen - 3) + '...'
    : insight;

  const esc = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

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

  const insightLines = wrapText(displayInsight, 34);
  const insightStartY = 322;
  const insightSvg = insightLines.map((line, i) =>
    `<text x="200" y="${insightStartY + i * 24}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="15" fill="${grade.paper}" fill-opacity="0.86" text-anchor="middle">${esc(line)}</text>`
  ).join('\n    ');

  const afterInsightY = insightStartY + insightLines.length * 24;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${grade.ink}"/>
      <stop offset="100%" style="stop-color:${grade.ink}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="0%" r="75%">
      <stop offset="0%" style="stop-color:${grade.accent}" stop-opacity="0.22"/>
      <stop offset="100%" style="stop-color:${grade.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="400" height="580" fill="url(#bg)"/>
  <rect width="400" height="580" fill="url(#glow)"/>

  <!-- Letterbox bars -->
  <rect x="0" y="0" width="400" height="26" fill="#000000" opacity="0.55"/>
  <rect x="0" y="554" width="400" height="26" fill="#000000" opacity="0.55"/>

  <!-- Frame -->
  <rect x="14" y="14" width="372" height="552" fill="none" stroke="${grade.accent}" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Wordmark -->
  <text x="200" y="62" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-weight="600" font-size="12" fill="${grade.accent}" text-anchor="middle" letter-spacing="6">STORYDUEL</text>

  <!-- Story title -->
  <text x="200" y="104" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="24" fill="${grade.paper}" text-anchor="middle">${esc(scenario?.title || 'A Story')}</text>
  <text x="200" y="128" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-size="10.5" fill="${grade.paper}" fill-opacity="0.55" text-anchor="middle" letter-spacing="2">WRITTEN BY ${esc(playerA.display_name.toUpperCase())} &amp; ${esc(playerB.display_name.toUpperCase())}</text>

  <line x1="160" y1="150" x2="240" y2="150" stroke="${grade.accent}" stroke-opacity="0.4" stroke-width="1"/>

  <!-- Score -->
  <text x="200" y="228" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="76" fill="${grade.accent}" text-anchor="middle">${score}%</text>
  <text x="200" y="254" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-weight="400" font-size="11.5" fill="${grade.paper}" fill-opacity="0.6" text-anchor="middle" letter-spacing="4">STORY SYNERGY</text>

  <line x1="140" y1="284" x2="260" y2="284" stroke="${grade.accent}" stroke-opacity="0.25" stroke-width="1"/>

  <!-- Insight -->
  <text x="200" y="308" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-size="10" fill="${grade.accent}" text-anchor="middle" letter-spacing="2">THE CLOSING LINE</text>
    ${insightSvg}

  <!-- Stats -->
  <text x="200" y="${afterInsightY + 34}" font-family="'Courier New', monospace" font-size="11.5" fill="${grade.paper}" fill-opacity="0.5" text-anchor="middle">6 beats &#183; 1 story &#183; 2 paths that crossed again</text>

  <!-- CTA -->
  <rect x="90" y="${Math.min(afterInsightY + 60, 478)}" width="220" height="38" rx="2" fill="none" stroke="${grade.accent}" stroke-width="1"/>
  <text x="200" y="${Math.min(afterInsightY + 84, 502)}" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-weight="500" font-size="12.5" fill="${grade.accent}" text-anchor="middle" letter-spacing="1">CAN YOU TELL THE SAME STORY?</text>

  <!-- Footer -->
  <text x="200" y="542" font-family="'Space Grotesk', 'Segoe UI', sans-serif" font-size="9.5" fill="${grade.paper}" fill-opacity="0.4" text-anchor="middle" letter-spacing="1">storyduel.app</text>
</svg>`;

  return svg;
}
