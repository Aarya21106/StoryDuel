# StoryDuel — Rework Architecture Plan

**Goal:** turn a 6-round choice game into a two-player cinematic narrative experience with
accounts, a story library, authored branching stories that diverge and reconverge, and a
film-grade visual identity.

---

## PART 0 — What exists today (audit)

| Layer | File | State |
|---|---|---|
| Narrative data | `server/src/scenarios.ts` | 15 stories = **1 sentence each**. No cast, no plot, no acts, no branches. |
| Narrative generation | `server/src/ai.ts` | Gemini invents *every* beat from scratch each round. Prompt asks for "1–2 sentences" + "3 choices, max 6 words". |
| Safety net | `server/src/fallbacks.ts` | 555 lines of authored beats used **only when AI fails**. The authored content is better than the AI content. |
| Loop | `server/src/game.ts` | Fixed 6 rounds. Both players see the **identical scene**. Difference between players = a hidden "secret objective" string that the engine never actually reads. |
| Divergence | — | **None.** Choices are compared for equality (`matched`) and produce a canned quip. They do not alter the next scene's structure, only feed the AI as loose history. |
| State | `types.ts` | 4 numeric axes (danger/trust/mystery/chaos) mutated by AI-supplied deltas. Never surfaced to the player. |
| Identity | `Landing.tsx` | Type a display name. No account, no persistence, no history. |
| Story selection | `pickScenario()` | Purely random. Players cannot choose a story. |
| Partner | `matchmaking.ts` | 6s queue, then a bot with ~10 canned lines per genre. |
| Visual | `index.css` | Dark charcoal + **four** competing accents (coral / violet / gold / neon), uppercase pill buttons, 🔒 emoji, springy bounce curves, "CHEMISTRY SCORE 87" + confetti. Reads as arcade, not cinema. |

### Bugs found while reading (fix during the rework, don't fix separately)

1. `game.ts:generateResults()` builds one transcript where `yourChoice` is **always player A's** choice, then sends it to both players. Player B's replay is inverted.
2. `game.ts:generateNextRound()` — `pickScenario([]).id === session.scenario_id ? ... : ...` is nonsense left over from a refactor; `scenario` is computed and never used.
3. `game.ts` passes `session.scenario_id` as `scenarioTitle` into the AI prompt, so the model sees `"last-train"` instead of `"The Last Train"`.
4. `recordGuess()` — `players.find(p => p.is_ai !== undefined)` matches every row; `partner` is assigned and unused.
5. `submitChoice` returns `bothSubmitted` from `choices.length >= 2`, which is a race if a player double-submits before the `UNIQUE(round_id, player_id)` insert lands. Needs a transactional compare-and-set.
6. `index.ts` catch-all `app.get('*')` is mounted **above** the socket setup but also above nothing else — fine now, but it will swallow future `/api/*` routes added below it.
7. No `writePrompt` scheduling for the human-vs-human path on `join_invite` (AI branch only calls `scheduleAIForRound` in stranger mode) — friend mode with a disconnect hangs forever. No round timeout anywhere.

---

## PART 1 — The core design decision

> **Invert the authoring model.**
> Today: *AI writes the story, authored text is the fallback.*
> After: *A human-authored Story Bible is the story, AI is the renderer.*

This single change is what fixes "the stories feel thin." An LLM asked for two sentences and
three six-word options will always produce two sentences and three six-word options. You cannot
prompt your way to a well-plotted story; you have to plot it.

The AI's new job is narrower and it is excellent at it:

- **Re-render** an authored beat in light of what *this* pair actually did (rewrite 60 authored
  words into 60 bespoke words naming their earlier choices).
- **Voice** an NPC replying to a player's free-text line.
- **Write the closing credit paragraph** from a known ending ID + known flags.

If every AI call fails, the game still plays the authored prose start to finish and nobody can
tell. That is the reliability property the current design does not have.

---

## PART 2 — The narrative engine: the Hourglass

The requirement is: *"if she makes a decision the story shifts... both of them end up in the same
timeline at the end."* The structure that delivers that is a braided hourglass, repeated once per act.

```
        ┌──────────── ACT I : TOGETHER ────────────┐
                    shared prologue beat
                 (same event, two POVs)
                            │
        ┌───────────────────┴───────────────────┐
   ACT II : SPLIT                          (the divergence)
   Player A lane                            Player B lane
   a1 → a2 → a3                             b1 → b2 → b3
   each choice sets FLAGS      ⇄ flags cross over ⇄
   A's beat text is rewritten by B's flags, and vice versa
        └───────────────────┬───────────────────┘
                            │
                   ⟡ CONVERGENCE BEAT ⟡
        both characters in the same room, same scene text,
        assembled from BOTH players' accumulated flags
                            │
        ┌──────────── ACT III : TOGETHER ───────────┐
              joint beat — both choose simultaneously
              outcome = MATRIX[choiceA][choiceB]
                            │
                    ENDING (1 of 6)
                selected by flags + joint outcome
```

**The invariant that makes it work:** *position converges, texture diverges.*
Every lane node declares `convergeTo: "C1"`. No matter which path you walk, you arrive at the same
node. What you carry into it — flags, wounds, items, what the other character believes about you —
is different. So the story genuinely shifted, and you genuinely met again.

### Beat types

| Type | What the player sees | Why it exists |
|---|---|---|
| `scene` | Prose + 3 choices with tone tags | The workhorse |
| `dialogue` | An NPC speaks; you pick a **reply line**, verbatim, in quotes | "Realistic conversations" |
| `comms` | A live 45s window to type one message **to the other player**, in character | The single most engaging beat in the game |
| `act_of` | Free text, 20–150 chars, AI voices the NPC's reaction | Already half-built (`write` round) |
| `convergence` | Shared scene, no choice, cinematic reveal of what the other did | The emotional payoff |
| `joint` | Both choose from the same 3 options; outcome from a 3×3 matrix | The climax |
| `title_card` | "ACT TWO — WHAT SHE DIDN'T SAY" | Pacing / cinema |

### Choice writing rules (replace the current 6-word stubs)

Every choice is an **intention**, not an action verb, and carries a tone tag:

```
✗  "Walk toward them"
✓  "Walk toward her, hands where she can see them."   [ CAUTIOUS ]
✓  "Say her name. Loud enough that other people hear." [ RECKLESS ]
✓  "Stay seated. Let her come to you."                 [ COLD ]
```

12–18 words. The tone tag is what the *other* player later learns about you, and it feeds the flag
system. It also renders beautifully — a small letter-spaced label under each option.

### Flags, not stats

Drop `danger/trust/mystery/chaos` as an AI-mutated numeric soup. Replace with an explicit,
authored flag set per story:

```ts
flags: {
  'a.knows_about_the_letter': boolean,
  'a.lied_to_b': boolean,
  'b.has_the_key': boolean,
  'b.trusts_a': -2..+2,
  'shared.police_involved': boolean,
}
```

Authored, testable, readable in a debug view, and directly usable in beat conditions:

```ts
{ id: 'C1', requires: { 'shared.police_involved': true }, text: '...' }
```

Keep two derived numbers for UI mood only: `tension` (0–100, drives the color grade / vignette)
and `closeness` (0–100, drives the ending selection tiebreak).

### Story Bible schema

```ts
interface StoryBible {
  id: string;
  title: string;
  logline: string;            // one line for the dashboard card
  synopsis: string;           // 3–4 sentences for the briefing screen
  genre: Genre;
  tone: string[];             // ['slow-burn','paranoid','monsoon']
  runtime: '8-10 min';
  contentNotes: string[];     // ['mild violence'] — shown before start
  grade: ColorGrade;          // per-story palette, see Part 5
  cast: {
    a: Character;             // { name, age, role, wants, fears, secret, voice }
    b: Character;
    npcs: Character[];
  };
  premise: string;            // "What is happening" — briefing screen
  relationship: string;       // "You two used to be..." — briefing screen
  acts: Act[];
  beats: Record<string, Beat>;
  endings: Ending[];          // 6, keyed by flag predicates
  authoredFallbackOrder: string[]; // linear path if everything fails
}
```

Everything lives in `server/src/stories/<id>.ts` — one file per story, typed, unit-testable.

### Convergence validator (must-build, ~80 lines)

A script that loads every bible and asserts:

- every `next` / `convergeTo` id exists
- every lane node reaches its act's convergence node in ≤ N hops
- every ending is reachable by at least one flag assignment
- no beat has fewer than 2 or more than 4 choices
- both lanes in an act have equal beat counts (so players never wait long)

Run it in `npm test`. Without this, branching content rots within a week.

---

## PART 3 — Accounts, library, lobby

### 3.1 Auth

Minimal, self-hosted, no third party:

```
POST /api/auth/register  { username, password, displayName }  → { token, user }
POST /api/auth/login     { username, password }                → { token, user }
GET  /api/me                                                   → { user, stats, activeRun }
```

- `bcrypt` (cost 10) for hashing — add to `server/package.json`.
- JWT in `localStorage`, 30-day expiry. `jsonwebtoken` is already a dependency (admin uses it).
- Socket auth: `io.use()` middleware reading `socket.handshake.auth.token`.
- Username: 3–20 chars, `[a-z0-9_]`, unique, case-insensitive. Display name separate and editable.
- Keep a **"Play as guest"** path. Forcing signup before anyone has seen a story will kill your
  funnel. Guests get a device-local id and can claim it into a real account after their first run.

### 3.2 The flow you asked for

```
Landing ──► Sign up / Log in / Continue as guest
              │
              ▼
        ┌─── LIBRARY (dashboard) ──────────────────────┐
        │  16 story cards in a grid                    │
        │  poster art, title, logline, genre chip,     │
        │  runtime, "played 2×" / "3 of 6 endings"     │
        │  filters: genre · length · mood · new        │
        └──────────────┬───────────────────────────────┘
                       ▼
              STORY DETAIL (half-sheet)
              synopsis · cast · tone tags · content notes
              [ PLAY ]
                       ▼
              ┌── WHO WITH? ────────────────────────┐
              │ ▸ Invite a friend    (code + link)  │
              │ ▸ Match me with anyone              │
              │ ▸ Play with a Narrator (AI partner) │
              └──────────────┬──────────────────────┘
                             ▼
                    LOBBY  (host sees code, guest joins)
                    both see the SAME story chosen by host
                             ▼
                    ▸▸ BRIEFING ◂◂    ← the "story outline before it starts"
                             ▼
                    ACT I ...
```

Host picks the story; the invite code is bound to `story_id`. The joiner sees the story detail on
the join screen before accepting — no blind joins.

### 3.3 The Briefing screen (this is the piece you specifically asked for)

Full-screen, letterboxed, paced in 5 timed cards the player taps through. This is the single
biggest perceived-quality upgrade in the whole plan — it costs one component and turns a game into
a film.

```
1. TITLE CARD      Story title, one line of tone. Hold 2s.
2. THE SITUATION   "It is 11:40 PM. The city has been under water for
                    three days. The last bus out leaves in forty minutes."
3. YOU ARE         Your character card: name, photo/glyph, age, one line of
                    who you are, one line of what you want, and — private —
                    ONE SECRET only you know.
4. THEY ARE        Their character card, but only what YOUR character would
                    know. Their secret is hidden. ("You know Meera from
                    before. You do not know why she came back.")
5. THE RULES       "You will not always be in the same room. What you choose
                    changes what they see. You will meet again before the end."
                    [ BEGIN ]
```

Point 4 is what creates dramatic tension between two real people. Point 5 sets the expectation for
divergence and reconvergence, so the mechanic reads as authored rather than as a bug.

---

## PART 4 — Data model changes

```sql
-- NEW
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  display_name TEXT NOT NULL,
  password_hash TEXT,               -- NULL for guests
  is_guest INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen  DATETIME
);

CREATE TABLE user_story_progress (
  user_id  TEXT NOT NULL REFERENCES users(id),
  story_id TEXT NOT NULL,
  plays INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  endings_seen TEXT DEFAULT '[]',   -- JSON array of ending ids
  PRIMARY KEY (user_id, story_id)
);

-- RENAME sessions -> runs, ADD
ALTER TABLE runs ADD story_id      TEXT NOT NULL;
ALTER TABLE runs ADD host_user_id  TEXT REFERENCES users(id);
ALTER TABLE runs ADD act           INTEGER DEFAULT 1;
ALTER TABLE runs ADD flags         TEXT DEFAULT '{}';   -- JSON
ALTER TABLE runs ADD ending_id     TEXT;
-- mode CHECK becomes ('friend','stranger','narrator')

-- players -> run_players, ADD
ALTER TABLE run_players ADD user_id      TEXT REFERENCES users(id);
ALTER TABLE run_players ADD character_id TEXT NOT NULL;  -- 'a' | 'b'
ALTER TABLE run_players ADD current_node TEXT;           -- lane position
ALTER TABLE run_players ADD lane_flags   TEXT DEFAULT '{}';

-- rounds -> beats, ADD
ALTER TABLE beats ADD node_id       TEXT NOT NULL;
ALTER TABLE beats ADD beat_type     TEXT NOT NULL;  -- scene|dialogue|comms|joint|...
ALTER TABLE beats ADD pov           TEXT NOT NULL;  -- 'a'|'b'|'shared'
ALTER TABLE beats ADD authored_text TEXT NOT NULL;
ALTER TABLE beats ADD rendered_text TEXT;           -- AI output, nullable
ALTER TABLE beats ADD render_ms     INTEGER;

-- NEW: in-character messages between the two players
CREATE TABLE comms (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id),
  beat_id TEXT NOT NULL,
  from_player TEXT NOT NULL,
  body TEXT NOT NULL,
  is_moderated INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Ship this as `db.ts` migration steps (`user_version` pragma), not a wipe — you have live data.

---

## PART 5 — Visual direction: from arcade to cinema

### The one change that does the most work: **per-story color grade**

Each Story Bible ships a `grade`. On run start the client writes it to `:root` as CSS vars, so the
entire app color-grades itself to the story — like a film's LUT. A monsoon thriller is teal and
sodium-amber; a hospital story is cold green and bone white; a romance is dusk pink and warm grey.
Sixteen stories, sixteen distinct looks, one component set.

```css
/* base — replaces the 4-accent rainbow */
:root {
  --ink:        #0A0A0C;   /* near-black, slightly blue */
  --ink-raised: #131317;
  --paper:      #E8E3D9;   /* warm off-white, NOT pure white */
  --paper-dim:  #8B857B;
  --paper-faint:#4A463F;

  --accent:      var(--story-accent, #C97B4E);  /* ONE accent, story-driven */
  --accent-soft: color-mix(in oklab, var(--accent) 18%, transparent);

  --grain:   0.045;
  --vignette:0.55;

  /* filmic easing — no spring bounce anywhere */
  --ease-film: cubic-bezier(0.22, 0.61, 0.36, 1);
  --dur-beat:  720ms;
  --dur-cut:   1100ms;
}
```

### Typography

| Role | Now | Change to |
|---|---|---|
| Scene prose | Space Grotesk 700 | **Instrument Serif** or **Fraunces** — 1.35rem, line-height 1.7, `text-wrap: balance` |
| Choices | Outfit 500 | Outfit 400, 1.0rem, generous 20px padding |
| Tone tags / labels | — | JetBrains Mono 500, 0.6875rem, `letter-spacing: 0.18em`, uppercase |
| Headings | Space Grotesk | Keep, but drop to weight 500 |

Prose in a serif is *the* signal that separates "story app" from "mobile game." Cost: one font import.

### Kill list

| Remove | Replace with |
|---|---|
| `CHEMISTRY SCORE 87` + gradient text + confetti | **End credits roll** — slow scroll: story title, "Directed by [both names]", the ending you reached, then the 3 choices that mattered most |
| 🔒 emoji, `LOCKED IN 🔒` | Thin animated underline that seals left→right |
| Uppercase pill buttons | Sentence-case, 4px radius, 1px hairline border |
| Springy `cubic-bezier(0.34,1.56,...)` | `--ease-film`, 700–1100ms |
| Orbiting tri-color dots | A single slow breathing dot + rotating in-world flavor lines ("Somewhere, a phone is ringing…") |
| 4 accent colors at once | 1 story accent + paper + ink |
| `matched / clash` scoring language | "You were both there." / "She never saw you do that." |

### Add

- **Letterbox bars** — 8vh top/bottom during beats, animating in over 900ms at act starts. Instant cinema.
- **Vignette + grain** on a fixed overlay, intensity driven by `tension`. Already have `noise.png`; add a radial-gradient vignette layer.
- **Ken Burns on the scene** — 1.00→1.04 scale over 20s on the beat container. Subtle, makes static text feel alive.
- **Prose reveal by line, not by character.** The current `TypewriterText` at 20ms/char is a game trope and it makes people wait. Fade lines in at 220ms stagger; whole paragraph readable in ~1s.
- **Act title cards** — full-bleed, letterspaced, 2.2s hold.
- **Convergence transition** — the two POV columns physically slide together and merge into one. This is the money shot; build it properly.
- `@media (prefers-reduced-motion: reduce)` — collapse everything to opacity fades. Non-negotiable.
- Story posters: don't buy art. Generate deterministic per-story SVG posters from the grade (gradient mesh + grain + typographic title). Looks intentional and costs nothing.

---

## PART 6 — AI layer rework

Three narrow prompts replace the current one broad one.

**1. `renderBeat()` — the workhorse**
```
Input : authored beat text, both characters' names, the 2–3 flags that are
        newly true, the other player's last action (one clause), tone tags
Task  : Rewrite the authored text in 45–75 words. Same events, same exits.
        Weave in exactly one specific callback to what they did.
Guard : If output changes the beat's meaning, drops below 30 words, or fails
        the schema → discard, use authored text. Player never knows.
Model : gemini-2.5-flash, temp 0.75, 4s timeout, no retry (fallback is good)
```

**2. `voiceNPC()`** — for `act_of` free-text beats. Given the NPC's character card + the player's
line, produce one reply of ≤ 25 words in that NPC's voice. Fallback: authored generic reply from
the bible.

**3. `writeCredits()`** — at the end, given ending id + flag diff + the 6 real choices, write the
closing paragraph. This replaces `generateFinalAnalysis`. Temp 0.6.

**Critical:** pre-render. When both players lock a choice, immediately fire `renderBeat()` for
*both* possible next nodes in the background while the reveal animation plays (~3.5s). By the time
the beat is needed it's already in the DB. Kills all perceived latency.

**Cost note:** ~8 flash calls per run at ~400 tokens each. Negligible, and every one is optional.

### The AI partner ("Narrator mode")

Currently 10 canned lines per genre. Rework:

- The bot **plays character B from the bible** — it has a name, a want, a secret, a voice sample.
- Choice selection is driven by the character's `wants`/`fears` weighted against current flags, not
  by choice index position. Authored per-beat: each choice carries `appealsTo: ['cautious','loyal']`
  and the bot has a temperament vector.
- `comms` beats: one `gemini-flash` call, given the character card + conversation so far, ≤ 20 words.
- Human-like timing: 4–14s, longer on beats with more text, occasional "typing…" that stops and
  restarts.

Keep the human-or-AI guess at the end. With a real character behind it, it becomes genuinely hard —
which is the fun.

---

## PART 7 — Socket protocol

Beats are now per-POV, so payloads must be per-socket, never `io.to(room).emit` for beat content.

```
C→S  auth:token
C→S  lobby:create   { storyId }              → S→C lobby:created { code, runId }
C→S  lobby:join     { code }                 → S→C lobby:ready   { story, cast }
C→S  briefing:done                           → both ready ⇒ act starts
S→C  act:start      { act, titleCard, grade }
S→C  beat:push      { beatId, type, pov, text, choices[], deadlineAt }
C→S  beat:choose    { beatId, choiceId }
S→C  beat:partner_locked
S→C  beat:reveal    { yours, theirs|null, consequence }   ← per-POV
S→C  comms:open     { deadlineAt }
C→S  comms:send     { body }        S→C comms:receive { from, body }
S→C  converge       { sharedText, whatTheyDid[] }
S→C  run:end        { endingId, credits, choicesThatMattered[] }
```

Add: `deadlineAt` on every beat (60s scene, 45s comms, 90s free-text). On expiry the server picks
the character's default choice and marks `flags['x.hesitated']`. This fixes the current
hang-forever-on-disconnect problem *and* is good drama.

Add: reconnect. `GET /api/runs/:id/resume` replays the run state so a dropped phone doesn't kill a
10-minute story. Currently a refresh loses everything.

---

## PART 8 — The 16 stories

Do **not** write 16 bibles before the engine works. Order:

**Tier 1 — 4 flagship bibles, fully authored (build alongside the engine).**
Pick maximum structural variety so the engine gets stress-tested:

1. **The Last Train** *(thriller)* — you two are in different carriages of the same stopped train. Convergence: carriage 4. Already has the best fallback content in the repo; upgrade it.
2. **Last Day in Chennai** *(romance, slow)* — no danger, all subtext. Tests `dialogue` and `comms` beats. Divergence: she's at the airport, he's at the flat.
3. **3:17 AM** *(horror)* — one apartment, two rooms. The tightest possible convergence. Tests dread pacing and the tension→grade coupling.
4. **Wrong Wedding** *(comedy)* — tests that the engine works when tone is light; comedy exposes stiff writing instantly.

**Tier 2 — 8 more**, reusing structures proven in Tier 1.
**Tier 3 — 4 more**, including one experimental (e.g. asymmetric length: one player gets 3 long beats while the other gets 6 short ones).

Budget honestly: a good bible is ~35 beats, ~2,500 words of authored prose, 6 endings.
That's a real half-day of writing per story. 16 stories ≈ 8 focused days of writing alone.
The engine work is independent of it — build the engine against 2 bibles, then write in parallel.

---

## PART 9 — Implementation roadmap

Each phase ends with a working app. Never leave the tree broken.

### Phase 1 — Foundations (no visible change)
- `db.ts`: migration runner (`PRAGMA user_version`), add `users`, `user_story_progress`, `comms`; rename tables.
- `auth.ts`: register / login / me, bcrypt, JWT, socket middleware.
- Fix bugs 1–7 from Part 0.
- **Deliverable:** existing game still plays, now behind optional accounts.

### Phase 2 — Story Bible engine
- `types/bible.ts`, `stories/index.ts` loader, `engine/BeatGraph.ts` (resolve node → next node given choice + flags), `engine/Flags.ts`, `scripts/validate-bibles.ts`.
- Port `last-train` from `fallbacks.ts` into a real bible with lanes + convergence.
- `game.ts` → `engine/RunManager.ts` driving the graph instead of counting to 6.
- **Deliverable:** one story playable end-to-end with real divergence and reconvergence, zero AI.

### Phase 3 — AI as renderer
- Rewrite `ai.ts` into `renderBeat` / `voiceNPC` / `writeCredits` with strict validation + silent fallback.
- Pre-render pipeline during reveal animations.
- **Deliverable:** same story, now bespoke prose, still unbreakable.

### Phase 4 — Library, lobby, briefing
- `LibraryScreen`, `StoryDetailSheet`, `PartnerPicker`, `LobbyScreen`, `BriefingSequence`.
- Poster SVG generator.
- Story-bound invite codes.
- **Deliverable:** the dashboard flow you described, working.

### Phase 5 — Visual rework
- New token layer, `ColorGrade` provider, serif prose, letterbox, vignette, grain-by-tension, act cards, convergence transition, credits roll.
- Delete: confetti, chemistry score, typewriter, orbit dots, spring curves.
- Reduced-motion pass + mobile pass (test at 360×640, current 440px container is fine).
- **Deliverable:** it looks like a film.

### Phase 6 — Comms + smarter partner
- `comms` beat type, live in-character messaging with moderation.
- Character-driven AI partner.
- **Deliverable:** the two players actually talk to each other.

### Phase 7 — Content scale-out
- Bibles 2–16, one per sitting, validator-gated.
- Admin dashboard: per-story completion, ending distribution, drop-off beat, AI render success rate, average beat latency.

---

## PART 10 — Where the risk is

| Risk | Mitigation |
|---|---|
| Branching content explodes and rots | The validator script in Phase 2. Non-optional. Also: divergence is *texture*, not position — lanes are 3 beats, not trees. Content stays linear-ish in volume. |
| Writing 16 bibles stalls the project | Ship with 4. A library of 4 great stories beats 16 thin ones, and the dashboard looks fine with 4 cards. |
| Waiting for a partner kills pacing | Every beat has a deadline. Lanes are length-matched by the validator. Narrator mode is always one tap away. |
| Free-text + real strangers | `moderation.ts` exists but is a 38-line wordlist. Comms needs at minimum: rate limit, length cap, block list, and a report action that actually stores something. Consider routing comms through a flash safety check. |
| AI latency ruins the cinema | Pre-render during reveal. 4s timeout, no retries, silent authored fallback. Never show a spinner mid-story. |
| Mobile: 10-minute runs on a phone | Reconnect/resume in Phase 1's DB work; don't defer it. |

---

## Immediate next step

Say the word and I'll start **Phase 1** — migrations, auth, and the seven bug fixes — then
**Phase 2** with *The Last Train* rebuilt as the first real Story Bible so you can feel the
divergence-and-reconvergence loop before we commit to writing fifteen more.
