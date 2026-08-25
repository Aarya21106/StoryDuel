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
          <div className="eyebrow" style={{ marginBottom: '8px' }}>One last guess</div>
          <h3 style={{ marginBottom: '8px' }}>Was your co-author real?</h3>
          <p className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '20px' }}>
            Did you just play with a real person, or an AI narrator undercover?
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <PulseButton
              variant="secondary"
              onClick={() => handleSelect('human')}
              disabled={!!selectedGuess}
            >
              A real person
            </PulseButton>

            <PulseButton
              variant="secondary"
              onClick={() => handleSelect('ai')}
              disabled={!!selectedGuess}
            >
              The AI
            </PulseButton>
          </div>
        </div>
      ) : (
        <div className="stagger">
          <div className="eyebrow" style={{ marginBottom: '6px' }}>Your co-author was</div>
          <h2 style={{ color: 'var(--accent)', marginBottom: '12px' }}>
            {guessResult.partnerIsAI ? 'The AI narrator' : 'A real person'}
          </h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            {guessResult.explanation}
          </p>
        </div>
      )}
    </div>
  );
};
