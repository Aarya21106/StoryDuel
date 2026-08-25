import React, { useState, useEffect } from 'react';
import { PulseButton } from './ui/PulseButton';

interface FriendJoinProps {
  inviteCode: string;
  onJoin: (code: string, name: string) => void;
  onHome: () => void;
}

export const FriendJoin: React.FC<FriendJoinProps> = ({ inviteCode, onJoin, onHome }) => {
  const [name, setName] = useState('');
  const [inviteInfo, setInviteInfo] = useState<{
    creatorName: string;
    scenarioTitle: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/invite/${inviteCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invite not found');
        return res.json();
      })
      .then((data) => {
        setInviteInfo({
          creatorName: data.creatorName,
          scenarioTitle: data.scenarioTitle,
        });
        setLoading(false);
      })
      .catch((e) => {
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
        <h2 style={{ marginBottom: '16px' }}>Story Not Found</h2>
        <p className="text-muted" style={{ marginBottom: '32px' }}>{error}</p>
        <PulseButton variant="primary" onClick={onHome}>
          GO TO STORYDUEL HOME
        </PulseButton>
      </div>
    );
  }

  return (
    <div className="screen app-container" style={{ justifyContent: 'center' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-coral)', marginBottom: '12px', fontWeight: 600 }}>
          YOU'VE BEEN INVITED
        </div>

        <h2 style={{ marginBottom: '8px' }}>
          {inviteInfo?.creatorName} wants to build a story with you.
        </h2>

        <p className="text-muted" style={{ fontSize: '0.9375rem', marginBottom: '36px' }}>
          Scenario: <strong style={{ color: 'var(--text-cream)' }}>{inviteInfo?.scenarioTitle}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'left', marginBottom: '24px' }}>
          <label style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
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
              ACCEPT THE STORY
            </PulseButton>
          </div>
        </form>
      </div>
    </div>
  );
};
