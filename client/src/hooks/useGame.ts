import { useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';

export interface DimensionBreakdown {
  sync: number;
  risk: number;
  trust: number;
  direction: number;
}

export interface TranscriptItem {
  roundNumber: number;
  scene: string;
  yourChoice: string;
  theirChoice: string;
  matched: boolean;
}

export interface RoundData {
  roundId: string;
  roundNumber: number;
  totalRounds: number;
  roundType: 'choice' | 'write';
  sceneText: string;
  choices?: string[];
  writePrompt?: string;
}

export interface RoundRevealData {
  yourChoice: string;
  theirChoice: string;
  matched: boolean;
  reactionText: string;
  roundNumber: number;
}

export interface SessionCompleteData {
  transcript: TranscriptItem[];
  matchCount: number;
  clashCount: number;
  objectives: {
    yours: string;
    theirs: string;
  };
  chemistryScore: number;
  insight: string;
  breakdown: DimensionBreakdown;
  partnerIsAI: boolean;
  partnerName: string;
  sessionId: string;
}

export interface GuessResultData {
  correct: boolean;
  partnerIsAI: boolean;
  explanation: string;
}

export type ScreenState =
  | 'landing'
  | 'matching'
  | 'invite_created'
  | 'friend_join'
  | 'objective_reveal'
  | 'game_round'
  | 'waiting_for_other'
  | 'round_reveal'
  | 'story_transition'
  | 'final_reveal'
  | 'admin_login'
  | 'admin_dashboard';

export function useGame() {
  const [screen, setScreen] = useState<ScreenState>('landing');
  const [displayName, setDisplayName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('Co-author');
  const [scenarioTitle, setScenarioTitle] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Round State
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [roundReveal, setRoundReveal] = useState<RoundRevealData | null>(null);
  const [transitionText, setTransitionText] = useState<string>('The story is changing...');
  const [partnerLocked, setPartnerLocked] = useState(false);
  const [myLockedChoice, setMyLockedChoice] = useState<string | null>(null);

  // Final State
  const [finalResults, setFinalResults] = useState<SessionCompleteData | null>(null);
  const [guessResult, setGuessResult] = useState<GuessResultData | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Socket event setup
  useEffect(() => {
    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
    });

    socket.on('invite_created', (data: { inviteCode: string; sessionId: string; playerId: string }) => {
      setInviteCode(data.inviteCode);
      setSessionId(data.sessionId);
      setPlayerId(data.playerId);
      setScreen('invite_created');
    });

    socket.on('match_found', (data: { sessionId: string; playerId: string; partnerName: string; scenarioTitle: string }) => {
      setSessionId(data.sessionId);
      setPlayerId(data.playerId);
      setPartnerName(data.partnerName);
      setScenarioTitle(data.scenarioTitle);
    });

    socket.on('objective_assigned', (data: { objective: string }) => {
      setObjective(data.objective);
      setScreen('objective_reveal');
    });

    socket.on('round_start', (data: RoundData) => {
      setCurrentRound(data);
      setMyLockedChoice(null);
      setPartnerLocked(false);
      setScreen('game_round');
    });

    socket.on('partner_locked', () => {
      setPartnerLocked(true);
    });

    socket.on('round_reveal', (data: RoundRevealData) => {
      setRoundReveal(data);
      setScreen('round_reveal');
    });

    socket.on('scene_transition', (data: { transitionText: string }) => {
      setTransitionText(data.transitionText || 'The story is changing...');
      setScreen('story_transition');
    });

    socket.on('session_complete', (data: SessionCompleteData) => {
      setFinalResults(data);
      setScreen('final_reveal');
    });

    socket.on('guess_result', (data: GuessResultData) => {
      setGuessResult(data);
    });

    socket.on('error', (err: { message: string }) => {
      showToast(err.message || 'An error occurred');
    });

    return () => {
      socket.off('connect');
      socket.off('invite_created');
      socket.off('match_found');
      socket.off('objective_assigned');
      socket.off('round_start');
      socket.off('partner_locked');
      socket.off('round_reveal');
      socket.off('scene_transition');
      socket.off('session_complete');
      socket.off('guess_result');
      socket.off('error');
    };
  }, [showToast]);

  // Actions
  const playWithStranger = useCallback((name: string) => {
    setDisplayName(name);
    setScreen('matching');
    if (!socket.connected) socket.connect();
    socket.emit('join_matchmaking', { displayName: name });
  }, []);

  const createInvite = useCallback((name: string) => {
    setDisplayName(name);
    if (!socket.connected) socket.connect();
    socket.emit('create_invite', { displayName: name });
  }, []);

  const joinInvite = useCallback((code: string, name: string) => {
    setDisplayName(name);
    setInviteCode(code);
    setScreen('matching');
    if (!socket.connected) socket.connect();
    socket.emit('join_invite', { inviteCode: code, displayName: name });
  }, []);

  const submitChoice = useCallback((choiceText: string) => {
    if (!currentRound) return;
    setMyLockedChoice(choiceText);
    socket.emit('submit_choice', {
      roundId: currentRound.roundId,
      choiceText,
    });
  }, [currentRound]);

  const submitGuess = useCallback((guess: 'human' | 'ai') => {
    if (!sessionId) return;
    socket.emit('guess_partner', { sessionId, guess });
  }, [sessionId]);

  const replay = useCallback(() => {
    if (!displayName) return;
    setSessionId(null);
    setCurrentRound(null);
    setRoundReveal(null);
    setFinalResults(null);
    setGuessResult(null);
    setMyLockedChoice(null);
    setPartnerLocked(false);
    setScreen('matching');
    socket.emit('request_replay', { displayName });
    socket.emit('join_matchmaking', { displayName });
  }, [displayName]);

  return {
    screen,
    setScreen,
    displayName,
    sessionId,
    playerId,
    partnerName,
    scenarioTitle,
    objective,
    inviteCode,
    currentRound,
    roundReveal,
    transitionText,
    partnerLocked,
    myLockedChoice,
    finalResults,
    guessResult,
    toastMessage,
    showToast,
    playWithStranger,
    createInvite,
    joinInvite,
    submitChoice,
    submitGuess,
    replay,
  };
}
