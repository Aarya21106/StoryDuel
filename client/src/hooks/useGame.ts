import { useState, useEffect, useCallback } from 'react';
import { socket } from '../socket';
import { API_BASE_URL } from '../config';

export interface DimensionBreakdown {
  sync: number;
  risk: number;
  trust: number;
  direction: number;
}

export interface StoryGrade {
  accent: string;
  accentSoft: string;
  ink: string;
  paper: string;
}

export interface StoryListItem {
  id: string;
  title: string;
  genre: string;
  logline: string;
  synopsis: string;
  toneTags: string[];
  runtime: string;
  grade: StoryGrade;
}

export interface StoryBriefData {
  title: string;
  logline: string;
  synopsis: string;
  toneTags: string[];
  grade: StoryGrade;
  you: { name: string; role: string; want: string; secret: string };
  them: { name: string; role: string; want: string };
}

export interface TranscriptItem {
  roundNumber: number;
  beatKind: 'shared' | 'solo' | 'convergence';
  yourScene: string;
  yourChoice: string;
  theirScene?: string;
  theirChoice?: string;
  matched: boolean | null;
}

export interface RoundData {
  roundId: string;
  roundNumber: number;
  totalRounds: number;
  roundType: 'choice' | 'write';
  beatKind: 'shared' | 'solo' | 'convergence';
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
  storyTitle: string;
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
  | 'library'
  | 'story_detail'
  | 'matching'
  | 'invite_created'
  | 'friend_join'
  | 'briefing'
  | 'game_round'
  | 'round_reveal'
  | 'story_transition'
  | 'final_reveal'
  | 'admin_login'
  | 'admin_dashboard';

const DEFAULT_GRADE: StoryGrade = { accent: '#C9A24B', accentSoft: 'rgba(201,162,75,0.16)', ink: '#0B0D10', paper: '#EDE6D6' };

function applyGrade(grade: StoryGrade | null) {
  const root = document.documentElement.style;
  const g = grade || DEFAULT_GRADE;
  root.setProperty('--accent', g.accent);
  root.setProperty('--accent-soft', g.accentSoft);
  root.setProperty('--ink', g.ink);
  root.setProperty('--paper', g.paper);
}

export function useGame() {
  const [screen, setScreen] = useState<ScreenState>('landing');
  const [displayName, setDisplayName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('Co-author');
  const [scenarioTitle, setScenarioTitle] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Library / selection
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryListItem | null>(null);
  const [storyBrief, setStoryBrief] = useState<StoryBriefData | null>(null);

  // Round State
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [roundReveal, setRoundReveal] = useState<RoundRevealData | null>(null);
  const [transitionText, setTransitionText] = useState<string>('The story is changing...');
  const [transitionVariant, setTransitionVariant] = useState<'default' | 'converge'>('default');
  const [partnerLocked, setPartnerLocked] = useState(false);
  const [myLockedChoice, setMyLockedChoice] = useState<string | null>(null);
  const [laneMessage, setLaneMessage] = useState<string | null>(null);

  // Final State
  const [finalResults, setFinalResults] = useState<SessionCompleteData | null>(null);
  const [guessResult, setGuessResult] = useState<GuessResultData | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Fetch the story library once on mount.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stories`)
      .then((res) => res.json())
      .then((data) => setStories(data.stories || []))
      .catch(() => setStories([]));
  }, []);

  // Socket event setup
  useEffect(() => {
    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
    });

    socket.on('invite_created', (data: { inviteCode: string; sessionId: string; playerId: string; storyTitle?: string }) => {
      setInviteCode(data.inviteCode);
      setSessionId(data.sessionId);
      setPlayerId(data.playerId);
      if (data.storyTitle) setScenarioTitle(data.storyTitle);
      setScreen('invite_created');
    });

    socket.on('match_found', (data: { sessionId: string; playerId: string; partnerName: string; scenarioTitle: string }) => {
      setSessionId(data.sessionId);
      setPlayerId(data.playerId);
      setPartnerName(data.partnerName);
      setScenarioTitle(data.scenarioTitle);
    });

    socket.on('story_brief', (data: StoryBriefData) => {
      setStoryBrief(data);
      applyGrade(data.grade);
      setScreen('briefing');
    });

    socket.on('round_start', (data: RoundData) => {
      setCurrentRound(data);
      setMyLockedChoice(null);
      setPartnerLocked(false);
      setLaneMessage(null);
      setScreen('game_round');
    });

    socket.on('partner_locked', () => {
      setPartnerLocked(true);
    });

    socket.on('lane_advance', (data: { message: string }) => {
      setTransitionText(data.message);
      setTransitionVariant('default');
      setScreen('story_transition');
    });

    socket.on('lane_waiting', (data: { message: string }) => {
      setLaneMessage(data.message);
    });

    socket.on('story_converging', (data: { message: string }) => {
      setTransitionText(data.message);
      setTransitionVariant('converge');
      setScreen('story_transition');
    });

    socket.on('round_reveal', (data: RoundRevealData) => {
      setRoundReveal(data);
      setScreen('round_reveal');
    });

    socket.on('scene_transition', (data: { transitionText: string }) => {
      setTransitionText(data.transitionText || 'The story is changing...');
      setTransitionVariant('default');
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
      socket.off('story_brief');
      socket.off('round_start');
      socket.off('partner_locked');
      socket.off('lane_advance');
      socket.off('lane_waiting');
      socket.off('story_converging');
      socket.off('round_reveal');
      socket.off('scene_transition');
      socket.off('session_complete');
      socket.off('guess_result');
      socket.off('error');
    };
  }, [showToast]);

  // Actions
  const chooseStory = useCallback((story: StoryListItem) => {
    setSelectedStory(story);
    applyGrade(story.grade);
    setScreen('story_detail');
  }, []);

  const playWithStranger = useCallback((name: string, storyId?: string) => {
    setDisplayName(name);
    setScreen('matching');
    if (!socket.connected) socket.connect();
    socket.emit('join_matchmaking', { displayName: name, storyId });
  }, []);

  const playWithNarrator = useCallback((name: string, storyId?: string) => {
    setDisplayName(name);
    setScreen('matching');
    if (!socket.connected) socket.connect();
    socket.emit('join_matchmaking', { displayName: name, storyId, instantAI: true });
  }, []);

  const createInvite = useCallback((name: string, storyId?: string) => {
    setDisplayName(name);
    if (!socket.connected) socket.connect();
    socket.emit('create_invite', { displayName: name, storyId });
  }, []);

  const joinInvite = useCallback((code: string, name: string) => {
    setDisplayName(name);
    setInviteCode(code);
    setScreen('matching');
    if (!socket.connected) socket.connect();
    socket.emit('join_invite', { inviteCode: code, displayName: name });
  }, []);

  const confirmBriefing = useCallback(() => {
    socket.emit('ready_for_round1');
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
    setSessionId(null);
    setPlayerId(null);
    setCurrentRound(null);
    setRoundReveal(null);
    setFinalResults(null);
    setGuessResult(null);
    setMyLockedChoice(null);
    setPartnerLocked(false);
    setStoryBrief(null);
    setSelectedStory(null);
    setScreen('library');
    if (sessionId) socket.emit('request_replay', {});
  }, [sessionId]);

  return {
    screen,
    setScreen,
    displayName,
    setDisplayName,
    sessionId,
    playerId,
    partnerName,
    scenarioTitle,
    inviteCode,
    stories,
    selectedStory,
    storyBrief,
    currentRound,
    roundReveal,
    transitionText,
    transitionVariant,
    partnerLocked,
    myLockedChoice,
    laneMessage,
    finalResults,
    guessResult,
    toastMessage,
    showToast,
    chooseStory,
    playWithStranger,
    playWithNarrator,
    createInvite,
    joinInvite,
    confirmBriefing,
    submitChoice,
    submitGuess,
    replay,
  };
}
