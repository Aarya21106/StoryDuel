import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useAuth } from './hooks/useAuth';
import { Landing } from './components/Landing';
import { Library } from './components/Library';
import { StoryDetail } from './components/StoryDetail';
import { InviteCreated } from './components/InviteCreated';
import { Matching } from './components/Matching';
import { Briefing } from './components/Briefing';
import { GameRound } from './components/GameRound';
import { RoundReveal } from './components/RoundReveal';
import { StoryTransition } from './components/StoryTransition';
import { FinalReveal } from './components/FinalReveal';
import { FriendJoin } from './components/FriendJoin';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Profile } from './components/Profile';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AgeGateModal } from './components/AgeGateModal';
import { CreateStory } from './components/CreateStory';
import { MyStories } from './components/MyStories';
import { trackClientEvent } from './utils/analytics';
import { API_BASE_URL } from './config';
import type { StoryListItem } from './hooks/useGame';

type MetaScreen = 'none' | 'profile' | 'privacy' | 'create_story' | 'my_stories';

export const App: React.FC = () => {
  const game = useGame();
  const auth = useAuth();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [friendInviteParam, setFriendInviteParam] = useState<string | null>(null);
  const [metaScreen, setMetaScreen] = useState<MetaScreen>('none');

  // Check URL query parameters for invite links on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setFriendInviteParam(joinCode);
      game.setScreen('friend_join');
    }
  }, []);

  const handleAdminSuccess = (token: string) => {
    setAdminToken(token);
    game.setScreen('admin_dashboard');
  };

  const handleReport = () => {
    if (game.sessionId) {
      trackClientEvent('report', game.sessionId);
      game.showToast('Story reported. Our moderators will review it.');
    }
  };

  const handleChooseStory = (story: StoryListItem) => {
    game.chooseStory(story);
  };

  const handlePlayCustomStory = (story: StoryListItem) => {
    setMetaScreen('none');
    game.chooseStory(story);
  };

  const handleStoryCreated = async (storyId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stories/${storyId}`, {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
      });
      const data = await res.json();
      setMetaScreen('none');
      game.chooseStory(data);
    } catch {
      setMetaScreen('my_stories');
    }
  };

  // Meta screens (profile / privacy / creator) render on top of the normal game flow.
  if (metaScreen === 'profile' && auth.user) {
    return (
      <Profile
        user={auth.user}
        history={auth.history}
        onBack={() => setMetaScreen('none')}
        onSignOut={() => { auth.signOut(); setMetaScreen('none'); }}
        onDeleteAccount={async () => { await auth.deleteAccount(); setMetaScreen('none'); game.setScreen('landing'); }}
        onMyStories={() => setMetaScreen('my_stories')}
      />
    );
  }

  if (metaScreen === 'privacy') {
    return <PrivacyPolicy onBack={() => setMetaScreen('none')} />;
  }

  if (metaScreen === 'create_story') {
    return (
      <CreateStory
        authUser={auth.user}
        token={auth.token}
        onGoogleCredential={(credential) => auth.signInWithCredential(credential)}
        onBack={() => setMetaScreen('none')}
        onCreated={handleStoryCreated}
      />
    );
  }

  if (metaScreen === 'my_stories' && auth.token) {
    return (
      <MyStories
        token={auth.token}
        onBack={() => setMetaScreen('none')}
        onPlay={handlePlayCustomStory}
        onCreateNew={() => setMetaScreen('create_story')}
      />
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {game.toastMessage && (
        <div className="toast">
          {game.toastMessage}
        </div>
      )}

      {/* Age gate: shown when a brand-new Google sign-in needs confirmation */}
      {auth.pendingCredential && (
        <AgeGateModal
          onConfirm={auth.confirmAgeAndRetry}
          onCancel={auth.cancelAgeConfirm}
        />
      )}

      {/* Screen Router */}
      {game.screen === 'landing' && (
        <Landing
          onContinue={(name) => { game.setDisplayName(name); game.setScreen('library'); }}
          onAdminClick={() => game.setScreen('admin_login')}
        />
      )}

      {game.screen === 'library' && (
        <Library
          displayName={auth.user?.displayName || game.displayName}
          stories={game.stories}
          onChoose={handleChooseStory}
          onAdminClick={() => game.setScreen('admin_login')}
          onPrivacyClick={() => setMetaScreen('privacy')}
          authUser={auth.user}
          onGoogleCredential={(credential) => auth.signInWithCredential(credential)}
          onProfileClick={() => setMetaScreen('profile')}
          onCreateStoryClick={() => setMetaScreen('create_story')}
        />
      )}

      {game.screen === 'story_detail' && game.selectedStory && (
        <StoryDetail
          story={game.selectedStory}
          onBack={() => game.setScreen('library')}
          onPlayStranger={() => game.playWithStranger(game.displayName, game.selectedStory!.id)}
          onPlayNarrator={() => game.playWithNarrator(game.displayName, game.selectedStory!.id)}
          onInviteFriend={() => game.createInvite(game.displayName, game.selectedStory!.id)}
        />
      )}

      {game.screen === 'matching' && (
        <Matching />
      )}

      {game.screen === 'invite_created' && game.inviteCode && (
        <InviteCreated
          inviteCode={game.inviteCode}
          storyTitle={game.scenarioTitle}
          onBack={() => game.setScreen('library')}
        />
      )}

      {game.screen === 'friend_join' && friendInviteParam && (
        <FriendJoin
          inviteCode={friendInviteParam}
          onJoin={game.joinInvite}
          onHome={() => {
            window.history.replaceState({}, '', '/');
            game.setScreen('landing');
          }}
        />
      )}

      {game.screen === 'briefing' && game.storyBrief && (
        <Briefing brief={game.storyBrief} onBegin={game.confirmBriefing} />
      )}

      {game.screen === 'game_round' && game.currentRound && (
        <GameRound
          round={game.currentRound}
          partnerLocked={game.partnerLocked}
          myLockedChoice={game.myLockedChoice}
          laneMessage={game.laneMessage}
          onSubmitChoice={game.submitChoice}
        />
      )}

      {game.screen === 'round_reveal' && game.roundReveal && (
        <RoundReveal revealData={game.roundReveal} />
      )}

      {game.screen === 'story_transition' && (
        <StoryTransition transitionText={game.transitionText} variant={game.transitionVariant} />
      )}

      {game.screen === 'final_reveal' && game.finalResults && (
        <FinalReveal
          data={game.finalResults}
          myDisplayName={game.displayName}
          onGuessPartner={game.submitGuess}
          guessResult={game.guessResult}
          onPlayAgain={game.replay}
          onInviteFriend={() => game.setScreen('library')}
          onReport={handleReport}
        />
      )}

      {game.screen === 'admin_login' && (
        <AdminLogin
          onLoginSuccess={handleAdminSuccess}
          onCancel={() => game.setScreen(game.displayName ? 'library' : 'landing')}
        />
      )}

      {game.screen === 'admin_dashboard' && adminToken && (
        <AdminDashboard
          token={adminToken}
          onLogout={() => {
            setAdminToken(null);
            game.setScreen('landing');
          }}
        />
      )}
    </>
  );
};

export default App;
