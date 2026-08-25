import React, { useState, useEffect } from 'react';
import { PulseButton } from './ui/PulseButton';

interface FriendJoinProps {
  inviteCode: string;
  onJoin: (code: string, name: string) => void;
  onHome: () => void;
}

interface InviteInfo {
  creatorName: string;
  scenarioTitle: string;
  logline?: string;
  toneTags?: string[];
  runtime?: string;
}

export const FriendJoin: React.FC<FriendJoinProps> = ({ inviteCode, onJoin, onHome }) => {
  const [name, setName] = useState('');
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const base = import.meta.env.DEV ? 'http://localhost:3001' : '';
    fetch(`${base}/api/invite/${inviteCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invite not found');
        return res.json();
      })
      .then((data) => {
        setInviteInfo({
          creatorName: data.creatorName,
          scenarioTitle: data.scenarioTitle,
          logline: data.logline,
          toneTags: data.toneTags,
          runtime: data.runtime,
        });
        setLoading(false);
      })
      .catch(() => {
        setError('This story invite is invalid or has already expired.');
        setLoading(false);
      });
  }, [inviteCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name');
      return;
    }
    onJoin(inviteCode, trimmed);
  };

  if (loading) {
    return (
      <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="waiting-indicator" style={{ justifyContent: 'center' }}>
          <div className="waiting-dot" />
          <span>Opening story invitation...</span>
        </div>
      </div>
    );
  }

  if (error && !inviteInfo) {
    return (
      <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Story not found</h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>{error}</p>
        <PulseButton variant="primary" onClick={onHome}>
          Go to StoryDuel home
        </PulseButton>
      </div>
    );
  }

  return (
    <div className="screen app-container" style={{ justifyContent: 'center' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div className="eyebrow" style={{ marginBottom: '12px' }}>You've been invited</div>

        <h2 style={{ marginBottom: '8px' }}>
          {inviteInfo?.creatorName} started a story with you.
        </h2>

        <p className="text-muted" style={{ fontSize: '0.9375rem', marginBottom: '8px' }}>
          <strong style={{ color: 'var(--text-cream)', fontFamily: 'var(--font-serif)' }}>{inviteInfo?.scenarioTitle}</strong>
          {inviteInfo?.runtime ? ` · ${inviteInfo.runtime}` : ''}
        </p>

        {inviteInfo?.logline && (
          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '32px', fontFamily: 'var(--font-serif)' }}>
            {inviteInfo.logline}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'left', marginBottom: '24px' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            What should we call you?
          </label>
          <input
            type="text"
            className="input-minimal"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            maxLength={20}
            autoFocus
          />
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '6px' }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <PulseButton type="submit" variant="primary">
              Step into the story
            </PulseButton>
          </div>
        </form>
      </div>
    </div>
  );
};
