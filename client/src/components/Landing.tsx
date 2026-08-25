import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { Footer } from './ui/Footer';

interface LandingProps {
  onPlayStranger: (name: string) => void;
  onInviteFriend: (name: string) => void;
  onAdminClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({
  onPlayStranger,
  onInviteFriend,
  onAdminClick,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const validateName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a display name');
      return null;
    }
    if (trimmed.length > 20) {
      setError('Name should be under 20 characters');
      return null;
    }
    setError('');
    return trimmed;
  };

  const handlePlayStranger = () => {
    const valid = validateName();
    if (valid) onPlayStranger(valid);
  };

  const handleInviteFriend = () => {
    const valid = validateName();
    if (valid) onInviteFriend(valid);
  };

  return (
    <div className="screen app-container" style={{ justifyContent: 'space-between' }}>
      <div style={{ width: '100%', paddingTop: '16px' }}>
        <div style={{ letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--accent-coral)', marginBottom: '16px', fontWeight: 600 }}>
          STORYDUEL
        </div>

        <div className="stagger">
          <h1 style={{ marginBottom: '8px' }}>Two people.</h1>
          <h1 style={{ marginBottom: '8px' }}>One story.</h1>
          <h1 style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Zero coordination.</h1>
          
          <p className="text-muted" style={{ fontSize: '1.0625rem', marginBottom: '36px', maxWidth: '340px' }}>
            You and someone else make secret choices. Let's see what story you create together.
          </p>
        </div>

        <div style={{ width: '100%', marginBottom: '32px' }}>
          <label style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            What should we call you?
          </label>
          <input
            type="text"
            className="input-minimal"
            placeholder="e.g. Aarya"
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <PulseButton variant="primary" onClick={handlePlayStranger}>
            PLAY WITH SOMEONE
          </PulseButton>

          <PulseButton variant="secondary" onClick={handleInviteFriend}>
            WRITE A STORY WITH A FRIEND
          </PulseButton>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
          3–4 min · No account · Just play
        </div>
      </div>

      <Footer onAdminClick={onAdminClick} />
    </div>
  );
};
