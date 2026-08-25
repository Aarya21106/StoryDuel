import { io } from 'socket.io-client';
import assert from 'assert';

console.log('🧪 Starting StoryDuel Automated Integration Test...');

const SOCKET_URL = 'http://localhost:3001';

async function runTest() {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
  });

  await new Promise<void>((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Connected to backend WebSocket server');
      resolve();
    });
    socket.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });

  console.log('🎮 1. Testing Stranger Matchmaking with AI fallback...');
  socket.emit('join_matchmaking', { displayName: 'Tester' });

  const matchData: any = await new Promise((resolve) => {
    socket.on('match_found', (data) => {
      console.log(`✅ Match Found! Partner: ${data.partnerName}, Scenario: "${data.scenarioTitle}"`);
      resolve(data);
    });
  });

  assert(matchData.sessionId, 'SessionId should exist');
  assert(matchData.partnerName, 'PartnerName should exist');

  const objective: any = await new Promise((resolve) => {
    socket.on('objective_assigned', (data) => {
      console.log(`✅ Secret Objective Assigned: "${data.objective}"`);
      resolve(data);
    });
  });

  // Play through all 6 rounds
  for (let r = 1; r <= 6; r++) {
    console.log(`\n🎲 Round ${r}: Waiting for round_start...`);
    const roundData: any = await new Promise((resolve) => {
      socket.on('round_start', (data) => {
        console.log(`  Scene: "${data.sceneText.substring(0, 40)}..."`);
        console.log(`  Type: ${data.roundType}`);
        resolve(data);
      });
    });

    socket.off('round_start');

    // Pick a choice or write response
    let choiceText = 'Wait and see';
    if (roundData.roundType === 'write') {
      choiceText = 'We need to figure this out together before it is too late.';
    } else if (roundData.choices && roundData.choices.length > 0) {
      choiceText = roundData.choices[0];
    }

    console.log(`  Submitting choice: "${choiceText}"`);
    socket.emit('submit_choice', {
      roundId: roundData.roundId,
      choiceText,
    });

    const revealData: any = await new Promise((resolve) => {
      socket.on('round_reveal', (data) => {
        console.log(`  Reveal: You ("${data.yourChoice}") vs Them ("${data.theirChoice}") → ${data.matched ? 'MATCH ✨' : 'CLASH ⚡'}`);
        resolve(data);
      });
    });

    socket.off('round_reveal');
  }

  console.log('\n🏆 Waiting for Final Results (session_complete)...');
  const finalData: any = await new Promise((resolve) => {
    socket.on('session_complete', (data) => {
      console.log(`✅ Game Complete!`);
      console.log(`  Story Chemistry: ${data.chemistryScore}%`);
      console.log(`  Insight: "${data.insight}"`);
      console.log(`  Matches: ${data.matchCount}, Clashes: ${data.clashCount}`);
      console.log(`  Secret Objectives: Yours="${data.objectives.yours}" | Theirs="${data.objectives.theirs}"`);
      console.log(`  Partner was AI: ${data.partnerIsAI}`);
      resolve(data);
    });
  });

  assert(typeof finalData.chemistryScore === 'number', 'Score should be a number');

  console.log('\n🤖 Testing Human/AI Guess...');
  socket.emit('guess_partner', {
    sessionId: matchData.sessionId,
    guess: 'ai',
  });

  const guessResult: any = await new Promise((resolve) => {
    socket.on('guess_result', (data) => {
      console.log(`✅ Guess Result: Correct=${data.correct} (${data.explanation})`);
      resolve(data);
    });
  });

  console.log('\n🔒 Testing Admin Authentication & Analytics API...');
  const loginRes = await fetch(`${SOCKET_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'storyduel_admin_2024' }),
  });
  const loginData: any = await loginRes.json();
  assert(loginData.token, 'Admin token should be returned');
  console.log('✅ Admin login succeeded, token acquired');

  const statsRes = await fetch(`${SOCKET_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${loginData.token}` },
  });
  const statsData: any = await statsRes.json();
  console.log(`✅ Admin stats fetched: Total Sessions = ${statsData.overview.total}, Completed = ${statsData.overview.completed}`);

  console.log('\n🎨 Testing Share Card SVG Route...');
  const cardRes = await fetch(`${SOCKET_URL}/api/card/${matchData.sessionId}`);
  const cardSvg = await cardRes.text();
  assert(cardSvg.includes('<svg'), 'Card endpoint should return SVG');
  assert(cardSvg.includes(`${finalData.chemistryScore}%`), 'SVG should contain chemistry score');
  console.log('✅ Share Card SVG rendered successfully');

  socket.disconnect();
  console.log('\n🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!\n');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Integration Test Failed:', err);
  process.exit(1);
});
