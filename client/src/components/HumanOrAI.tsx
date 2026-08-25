import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import type { GuessResultData } from '../hooks/useGame';

interface HumanOrAIProps {
  onGuess: (guess: 'human' | 'ai') => void;
  guessResult: GuessResultData | null;
}

export const HumanOrAI: React.FC<HumanOrAIProps> = ({ onGuess, guessResult }) => {
  const [selectedGuess, setSelectedGuess] = useState<'human' | 'ai' | null>(null);

  const handleSelect = (guess: 'human' | 'ai') => {
    if (selectedGuess) return;
    setSelectedGuess(guess);
    onGuess(guess);
  };

  return (
    <div className="glass-card" style={{ width: '100%', padding: '24px', textAlign: 'center', marginBottom: '36px' }}>
      {!selectedGuess || !guessResult ? (
        <div>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: 600 }}>
            ONE LAST GUESS...
          </div>
          <h3 style={{ marginBottom: '8px' }}>Was your co-author...</h3>
          <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '20px' }}>
            Did you play with a real human or an AI undercover?
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <PulseButton
              variant="secondary"
              onClick={() => handleSelect('human')}
              disabled={!!selectedGuess}
            >
              👤 HUMAN
            </PulseButton>

            <PulseButton
              variant="secondary"
              onClick={() => handleSelect('ai')}
              disabled={!!selectedGuess}
            >
              🤖 AI
            </PulseButton>
          </div>
        </div>
      ) : (
        <div className="stagger">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            YOUR CO-AUTHOR WAS...
          </div>
          <h2 style={{ color: guessResult.partnerIsAI ? 'var(--accent-violet)' : 'var(--accent-coral)', marginBottom: '12px' }}>
            {guessResult.partnerIsAI ? '🤖 ARTIFICIAL INTELLIGENCE' : '👤 A REAL HUMAN'}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {guessResult.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
