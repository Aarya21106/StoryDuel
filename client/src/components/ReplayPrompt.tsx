import React from 'react';
import { PulseButton } from './ui/PulseButton';

interface ReplayPromptProps {
  onPlayAgain: () => void;
  onInviteFriend: () => void;
  onReport: () => void;
}

export const ReplayPrompt: React.FC<ReplayPromptProps> = ({
  onPlayAgain,
  onInviteFriend,
  onReport,
}) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
      <PulseButton variant="primary" onClick={onPlayAgain}>
        Choose another story
      </PulseButton>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        That was fun. Try it with someone you know:
      </div>

      <PulseButton variant="secondary" onClick={onInviteFriend}>
        Invite a friend
      </PulseButton>

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={onReport}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          Report inappropriate story content
        </button>
      </div>
    </div>
  );
};
