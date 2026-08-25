# StoryDuel 🎭

> **Two people. One story. Zero coordination.**
>
> A mobile-first browser game where two people secretly co-create a story by making decisions independently.

---

## 🌟 The Experience

StoryDuel is built around one emotional loop:
**Curiosity → Decision → Uncertainty → Reveal → Surprise → Curiosity → Replay**

- **Stranger Story**: Match with someone in real time. If no human joins within 6 seconds, an undercover AI player is seamlessly assigned.
- **Friend Mode**: Generate an invite link (with 1-tap WhatsApp sharing) and co-create a story with live reveals.
- **Combinatorial Story Engine**: 15 varied genres (Mystery, Horror, Romance, Adventure, Emotional, Comedy, Sci-Fi, Chaos) combined with 50 locations, 50 incidents, 20 tones, and 30 objects for millions of unique seeds.
- **Secret Objectives**: Each player is silently given a hidden goal at round 0.
- **The Reveal**: Animated story timeline replay, match/clash statistics, secret objectives reveal, Story Chemistry count-up with AI insights, and "Human or AI?" deduction guess.
- **Share Card**: Dynamically generated SVG cards with 1-click PNG download for Instagram/WhatsApp stories.
- **Admin Dashboard**: Server-side password-protected telemetry (`/admin`) tracking conversion funnels, Story Chemistry averages, replay rates, and moderation events.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Vanilla CSS (Cinematic Charcoal & Warm Palette, Grain texture, Glassmorphism, Micro-animations)
- **Backend**: Node.js, Express, Socket.io (WebSocket), SQLite (`better-sqlite3`), Google Gen AI SDK (`@google/genai`)
- **Safety & Moderation**: Text safety filtering for free-write rounds, report system, zero stranger chat.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configure Environment
Copy `.env.example` to `.env` in the `server` directory:
```bash
cp server/.env.example server/.env
```
Add your `GEMINI_API_KEY` in `server/.env` (optional; deterministic fallback beats will automatically handle all 15 scenarios if no key is provided).

### 3. Run Development Server
```bash
npm run dev
```

- **Client App**: [http://localhost:5173](http://localhost:5173)
- **Backend Server**: [http://localhost:3001](http://localhost:3001)
- **Admin Dashboard**: [http://localhost:5173](http://localhost:5173) (click **Admin** in footer)
  - Default Username: `admin`
  - Default Password: `storyduel_admin_2024`

---

## 🧪 Testing

Run the automated integration test:
```bash
cd server
npx tsx test_game_loop.ts
```

---

## 📄 License
MIT
