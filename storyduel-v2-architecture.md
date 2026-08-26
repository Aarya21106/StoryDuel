# StoryDuel v2 — Architecture & Phased Build Plan

Extends the shipped v1 (6-round secret-choice duel between two strangers). v2 adds accounts, user-created stories, a new conversational mode, and a subscription.

**Core architectural principle carried through everything below:** the v1 round engine stays the engine. Custom stories and StoryDev do not get their own parallel engines — they produce different *seeds* and *round types* that feed the same state machine. Anything that would require a second engine is out of scope.

**Second principle:** every user-created story must be playable as a duel, not just solo. Solo AI storytelling is a crowded category with well-funded competitors. Two-people-secretly-shaping-one-story is yours. Don't drift out of your own moat.

---

## Mode Inventory (final — no other modes in v2)

| Mode | Input type | Partner | Risk surface |
|---|---|---|---|
| **Duel** (v1, shipped) | Taps + 1 short write | Stranger / friend / AI | Low |
| **Custom Story** | Taps + short writes | Solo-AI / friend / stranger | Medium (user-authored prompts) |
| **StoryDev** (new) | Free-text dialogue in character | AI / friend first; stranger last | **High — open chat surface** |

---

## StoryDev Mode — Design

Two players each *become* a character in a scene, and converse in-character. Unlike Duel (where you tap choices), here what you actually say reshapes the situation — the other person's reply changes your options, the AI referee reacts to the exchange and escalates the scenario.

**Structure per beat:**
1. AI referee sets the scene and gives each player their character brief privately (name, motivation, one secret they're hiding).
2. Players exchange 2-3 dialogue turns freely (character limit ~200 per turn, keeps pace up and moderation cheap).
3. Referee interjects with a complication generated from the exchange plus hidden state ("the door handle turns from the outside").
4. Every 3-4 beats, a **decision point**: both secretly pick an action, same mechanic as v1 — this preserves the "what did they choose" hook and stops it becoming pure freeform roleplay.
5. Repeat. 30 min ≈ 8-10 beats.

**Why it's interesting and not just chat:** the referee is actively adversarial to the scene, not to the players. Each player has a hidden character secret and a hidden objective, so dialogue has subtext — you're trying to get something without revealing why. That's the same engine as Duel (hidden info + shared state), expressed through conversation instead of taps.

**Ending reveal:** full transcript replay, both character secrets revealed, whether each player achieved their objective, a "Scene Chemistry" score, and a specific insight tied to what was actually said.

**Safety design — this is not optional for this mode:**
- Every dialogue line passes moderation *before* delivery to the other player. Blocked lines are returned to the sender to rewrite; the partner never sees them.
- In-character framing enforced in UI copy ("Say something as [character]") — reduces drift into out-of-character personal chat.
- No exchange of contact info: run a lightweight pattern check for phone numbers, handles, and emails, and block them.
- Report + immediate-exit button on every screen of this mode.
- **Launch order: AI partner → friend invite → stranger matching last**, and stranger matching for StoryDev requires a signed-in account, never guests. This is deliberate: it gives you real moderation telemetry before you expose strangers to each other.
- Age gate enforced at account level, not just a footer line.

---

## Phase Plan

### Phase 1 — Accounts (foundation, small)
- Google OAuth. Guest play stays fully functional — never gate the first taste of the product behind signup.
- Tables: `users` (id, google_sub, display_name, created_at, age_confirmed, tier), link existing `players` rows to `user_id` (nullable for guests).
- Profile screen: play history, created stories, subscription status.
- **Compliance work that must land here, not later:** India's DPDP Act applies once you hold real account data — privacy policy, account deletion flow, stated retention period, and a named grievance contact for user-generated content.

### Phase 2 — Custom Story Creator
- Prompt box + genre picker + length picker (10 / 20 / 30 min → 6 / 12 / 20 rounds).
- Backend converts the free-text prompt into a **structured scenario seed** matching the shape the v1 engine already consumes: `{ location, incident, tone, object, character_roles[], objective_pool[] }`. The creator generates a seed, not a story. This is the whole trick — near-zero new engine code.
- Moderation on the authored prompt at creation time, before it is ever playable.
- New tables: `stories` (id, author_user_id, title, seed_json, genre, length_rounds, visibility, mode_support[], created_at, play_count), `story_plays` (story_id, session_id, rating).

**New technical work in this phase — state summarization.** At 20 rounds you cannot feed full history into every call. Keep the last 3 rounds verbatim plus a rolling compressed summary of everything before. Regenerate the summary every 3 rounds. Budget real iteration time here; incoherence at round 15 is the most likely way a 30-minute story fails.

### Phase 3 — StoryDev Mode
Built on the same engine + a dialogue round type. Ship in the launch order given above (AI → friend → stranger). New round types: `dialogue` and `referee_interjection`. Everything else reuses Phase 2 infrastructure.

### Phase 4 — Publish / Library
- Private by default; explicit publish action triggers a stricter moderation pass.
- Library screen: "newest" and "most played" only. **No ratings, tags, search, or recommendation system yet** — discovery infrastructure built before you have content volume is wasted work. A plain list is correct at 40 stories.

### Phase 5 — Subscription (Razorpay — reuse the existing active merchant account)
- **Free:** unlimited Duel, unlimited *playing* of published stories, 3 custom story creations/month, 10-min length only, StoryDev vs AI only.
- **Paid (~₹149-199/month):** unlimited creation, all lengths up to 30 min, private stories, StoryDev with friends and strangers, priority matchmaking.
- Free tier stays genuinely generous on *playing*: players are what make creators' stories worth creating, and they cost you almost nothing. Meter creation, not consumption.
- Set exact limits only after measuring real per-story cost in production for a week.

### Phase 6 — Ratings, discovery, creator profiles
Only once library volume makes finding something a real problem.

---

## Cross-Cutting Infrastructure

- **Per-user cost + rate limiting from Phase 2 onward.** A UGC generator with no limits is an unbounded API bill one curious user away from happening. Hard caps: concurrent sessions per user, story creations per hour, regenerations per story.
- **Moderation pipeline as a shared service** — one interface used by prompt creation, publish, the v1 write round, and every StoryDev line. Log every block for review; these logs are what tell you whether stranger StoryDev is safe to open up.
- **Model routing:** cheap fast model for round generation and moderation; step up only for the final reveal insight, where quality is visible and it runs once per session.
- **Graceful degradation:** malformed JSON → retry once → fall back to a pre-written generic beat. Never surface a raw error mid-story.
- **Partner dropout handling** (now genuinely necessary at 20 rounds — it wasn't at 6): if a partner disconnects mid-session, AI silently assumes their role and the session continues. Tell the player at the reveal, not during.

---

## Explicitly Out of Scope for v2

60-minute stories, voice or image input, AI-generated illustration, real-time free chat outside StoryDev's in-character structure, creator monetization/revenue-sharing, mobile native apps, and any third game mode.

---

## What to Measure

Per phase, one question:
- Phase 2: do people who create a story ever play a second one?
- Phase 3: does StoryDev have a higher completion rate than Duel? (If it doesn't, dialogue is friction, not fun — and that's a finding worth having.)
- Phase 4: what percentage of created stories are ever published, and ever played by someone other than the author?
- Phase 5: conversion rate, and whether paid users create more or just play more.

Replay rate remains the single north-star metric from v1. If v2 features don't raise it, they're not working, regardless of how impressive they are.
