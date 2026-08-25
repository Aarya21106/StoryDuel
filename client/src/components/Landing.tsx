import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { Footer } from './ui/Footer';

interface LandingProps {
  onContinue: (name: string) => void;
  onAdminClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onContinue, onAdminClick }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Tell us what to call you first');
      return;
    }
    if (trimmed.length > 20) {
      setError('Keep it under 20 characters');
      return;
    }
    onContinue(trimmed);
  };

  return (
    <div className="screen app-container" style={{ justifyContent: 'space-between' }}>
      <div style={{ width: '100%', paddingTop: '16px' }}>
        <div className="eyebrow" style={{ marginBottom: '16px' }}>StoryDuel</div>

        <div className="stagger">
          <h1 style={{ marginBottom: '8px' }}>Two people.</h1>
          <h1 style={{ marginBottom: '8px' }}>One story.</h1>
          <h1 style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Choices that cross.</h1>

          <p className="text-muted" style={{ fontSize: '1.0625rem', marginBottom: '36px', maxWidth: '360px' }}>
            You and someone else each walk your own side of the same story. What you decide changes what they see. You meet again before the end.
          </p>
        </div>

        <div style={{ width: '100%', marginBottom: '28px' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
            maxLength={20}
            autoFocus
          />
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '6px' }}>
              {error}
            </div>
          )}
        </div>

        <PulseButton variant="primary" onClick={handleContinue}>
          Continue
        </PulseButton>

        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
          A story library awaits · no account needed
        </div>
      </div>

      <Footer onAdminClick={onAdminClick} />
    </div>
  );
};
