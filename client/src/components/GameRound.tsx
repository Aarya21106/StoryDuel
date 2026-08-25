import React, { useState } from 'react';
import { ProgressDots } from './ui/ProgressDots';
import { TypewriterText } from './ui/TypewriterText';
import { GlassCard } from './ui/GlassCard';
import { PulseButton } from './ui/PulseButton';
import { CharacterCounter } from './ui/CharacterCounter';
import type { RoundData } from '../hooks/useGame';

interface GameRoundProps {
  round: RoundData;
  partnerLocked: boolean;
  myLockedChoice: string | null;
  laneMessage: string | null;
  onSubmitChoice: (choice: string) => void;
}

export const GameRound: React.FC<GameRoundProps> = ({
  round,
  partnerLocked,
  myLockedChoice,
  laneMessage,
  onSubmitChoice,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(myLockedChoice);
  const [writeText, setWriteText] = useState('');

  const handleSelectChoice = (choice: string) => {
    if (selectedChoice) return; // already locked
    setSelectedChoice(choice);
    onSubmitChoice(choice);
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = writeText.trim();
    if (trimmed.length >= 20 && !selectedChoice) {
      setSelectedChoice(trimmed);
      onSubmitChoice(trimmed);
    }
  };

  const isWriteRound = round.roundType === 'write';
  const isSolo = round.beatKind === 'solo';

  return (
    <div className="screen app-container" style={{ justifyContent: 'space-between' }}>
      <div style={{ width: '100%' }}>
        {/* Header with Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <ProgressDots currentRound={round.roundNumber} totalRounds={round.totalRounds} />
          <span className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
            {round.roundNumber} / {round.totalRounds}
          </span>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <span className={`beat-badge ${isSolo ? 'solo' : ''}`}>
            <span className="dot" />
            {isSolo ? 'Your path alone' : round.beatKind === 'convergence' ? 'Paths cross again' : 'Together'}
          </span>
        </div>

        {/* Scene Text */}
        <div className="ken-burns" style={{ marginBottom: '32px', minHeight: '100px', overflow: 'hidden' }}>
          <TypewriterText
            text={round.sceneText}
            speed={32}
            className="scene-text"
          />
        </div>

        {/* Prompt / Instructions */}
        <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
          {isWriteRound ? round.writePrompt || 'What do you say?' : 'What do you do?'}
        </div>

        {/* Choices or Free Text */}
        {isWriteRound ? (
          <form onSubmit={handleWriteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              className="textarea-write"
              placeholder="Say something in 20–150 characters..."
              value={writeText}
              onChange={(e) => setWriteText(e.target.value)}
              disabled={!!selectedChoice}
              maxLength={150}
              rows={3}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CharacterCounter current={writeText.length} max={150} min={20} />
              <div />
            </div>

            <PulseButton
              type="submit"
              variant="primary"
              disabled={writeText.trim().length < 20 || !!selectedChoice}
            >
              {selectedChoice ? 'Sealed' : 'Lock it in'}
            </PulseButton>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {round.choices?.map((choice, i) => {
              const isSelected = selectedChoice === choice;
              const isFaded = !!selectedChoice && !isSelected;

              return (
                <GlassCard
                  key={i}
                  className={`choice-card ${isFaded ? 'faded' : ''}`}
                  selected={isSelected}
                  onClick={() => handleSelectChoice(choice)}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{choice}</span>
                      {isSelected && <span className="lock-label">Sealed</span>}
                    </div>
                    {isSelected && <span className="seal-underline" />}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Partner Status Footer */}
      <div style={{ width: '100%', paddingTop: '24px', textAlign: 'center' }}>
        {isSolo ? (
          <div className="waiting-indicator" style={{ justifyContent: 'center', opacity: selectedChoice ? 1 : 0 }}>
            <div className="waiting-dot" />
            <span>{laneMessage || 'Carrying this choice forward...'}</span>
          </div>
        ) : selectedChoice ? (
          <div className="waiting-indicator" style={{ justifyContent: 'center' }}>
            <div className="waiting-dot" />
            <span>
              {partnerLocked
                ? 'Both sealed. Revealing what happened...'
                : "Your choice is sealed. They're still deciding..."}
            </span>
          </div>
        ) : (
          <div className="waiting-indicator" style={{ justifyContent: 'center', opacity: 0.7 }}>
            <div className="waiting-dot" />
            <span>
              {partnerLocked
                ? "They're sealed in. Your turn."
                : "They're deciding too..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
