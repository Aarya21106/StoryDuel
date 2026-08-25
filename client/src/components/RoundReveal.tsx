import React, { useState } from 'react';
import { CountdownTimer } from './ui/CountdownTimer';
import type { RoundRevealData } from '../hooks/useGame';

interface RoundRevealProps {
  revealData: RoundRevealData;
  onAnimationDone?: () => void;
}

export const RoundReveal: React.FC<RoundRevealProps> = ({ revealData }) => {
  const [phase, setPhase] = useState<'anticipation' | 'revealed'>('anticipation');

  return (
    <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
      {phase === 'anticipation' ? (
        <div>
          <div className="eyebrow" style={{ marginBottom: '24px' }}>They're sealed in</div>
          <CountdownTimer initialCount={3} onComplete={() => setPhase('revealed')} />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {revealData.matched ? (
            <div className="reveal-match" style={{ position: 'relative' }}>
              <div className="glow-pulse" />
              <div className="eyebrow" style={{ marginBottom: '10px' }}>Same moment</div>

              <h2 style={{ color: 'var(--accent)', marginBottom: '20px' }}>
                You both chose this.
              </h2>

              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', borderColor: 'var(--accent-soft)', background: 'var(--accent-soft)' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                  Without talking to each other
                </div>
                <div style={{ fontSize: '1.1875rem', fontFamily: 'var(--font-serif)', color: 'var(--text-cream)' }}>
                  "{revealData.yourChoice}"
                </div>
              </div>

              <p className="text-muted" style={{ fontStyle: 'italic' }}>
                {revealData.reactionText}
              </p>
            </div>
          ) : (
            <div>
              <div className="eyebrow" style={{ marginBottom: '24px' }}>Different decisions</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                <div className="glass-card reveal-clash-left" style={{ textAlign: 'left' }}>
                  <div className="text-muted" style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    You
                  </div>
                  <div style={{ fontSize: '1.0625rem', fontFamily: 'var(--font-serif)' }}>
                    "{revealData.yourChoice}"
                  </div>
                </div>

                <div className="text-dim" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  meanwhile
                </div>

                <div className="glass-card reveal-clash-right" style={{ textAlign: 'left', borderColor: 'var(--accent-soft)' }}>
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '4px' }}>
                    Them
                  </div>
                  <div style={{ fontSize: '1.0625rem', fontFamily: 'var(--font-serif)' }}>
                    "{revealData.theirChoice}"
                  </div>
                </div>
              </div>

              <p className="text-muted" style={{ fontStyle: 'italic' }}>
                {revealData.reactionText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
