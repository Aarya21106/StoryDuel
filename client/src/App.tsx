import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Landing } from './components/Landing';
import { InviteCreated } from './components/InviteCreated';
import { Matching } from './components/Matching';
import { ObjectiveReveal } from './components/ObjectiveReveal';
import { GameRound } from './components/GameRound';
import { RoundReveal } from './components/RoundReveal';
import { StoryTransition } from './components/StoryTransition';
import { FinalReveal } from './components/FinalReveal';
import { FriendJoin } from './components/FriendJoin';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { trackClientEvent } from './utils/analytics';

export const App: React.FC = () => {
  const game = useGame();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [friendInviteParam, setFriendInviteParam] = useState<string | null>(null);

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

  return (
    <>
      {/* Toast Notification */}
      {game.toastMessage && (
        <div className="toast">
          {game.toastMessage}
        </div>
      )}

      {/* Screen Router */}
      {game.screen === 'landing' && (
        <Landing
          onPlayStranger={game.playWithStranger}
          onInviteFriend={game.createInvite}
          onAdminClick={() => game.setScreen('admin_login')}
        />
      )}

      {game.screen === 'matching' && (
        <Matching />
      )}

      {game.screen === 'invite_created' && game.inviteCode && (
        <InviteCreated
          inviteCode={game.inviteCode}
          onBack={() => game.setScreen('landing')}
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

      {game.screen === 'objective_reveal' && (
        <ObjectiveReveal objective={game.objective} />
      )}

      {game.screen === 'game_round' && game.currentRound && (
        <GameRound
          round={game.currentRound}
          partnerLocked={game.partnerLocked}
          myLockedChoice={game.myLockedChoice}
          onSubmitChoice={game.submitChoice}
        />
      )}

      {game.screen === 'round_reveal' && game.roundReveal && (
        <RoundReveal revealData={game.roundReveal} />
      )}

      {game.screen === 'story_transition' && (
        <StoryTransition transitionText={game.transitionText} />
      )}

      {game.screen === 'final_reveal' && game.finalResults && (
        <FinalReveal
          data={game.finalResults}
          myDisplayName={game.displayName}
          onGuessPartner={game.submitGuess}
          guessResult={game.guessResult}
          onPlayAgain={game.replay}
          onInviteFriend={() => game.createInvite(game.displayName)}
          onReport={handleReport}
        />
      )}

      {game.screen === 'admin_login' && (
        <AdminLogin
          onLoginSuccess={handleAdminSuccess}
          onCancel={() => game.setScreen('landing')}
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
