import React, { useState } from 'react';
import { CountdownTimer } from './ui/CountdownTimer';
import { ParticleBurst } from './ui/ParticleBurst';
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
          <div style={{ textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            THEY'RE LOCKED IN
          </div>
          <CountdownTimer initialCount={3} onComplete={() => setPhase('revealed')} />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <ParticleBurst trigger={revealData.matched} colorType="gold" />

          {revealData.matched ? (
            <div className="reveal-match">
              <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: 600 }}>
                MATCH
              </div>

              <h2 style={{ color: 'var(--accent-gold)', marginBottom: '20px' }}>
                SAME BRAIN.
              </h2>

              <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', borderColor: 'rgba(245, 197, 66, 0.3)', background: 'var(--accent-gold-dim)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  YOU BOTH CHOSE THIS
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-cream)' }}>
                  "{revealData.yourChoice}"
                </div>
              </div>

              <p className="text-muted" style={{ fontStyle: 'italic' }}>
                {revealData.reactionText}
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-coral)', marginBottom: '24px', fontWeight: 600 }}>
                DIFFERENT DECISIONS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                <div className="glass-card reveal-clash-left" style={{ borderColor: 'rgba(255, 107, 74, 0.3)', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent-coral)', fontWeight: 600, marginBottom: '4px' }}>
                    YOU
                  </div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 500 }}>
                    "{revealData.yourChoice}"
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                  VS
                </div>

                <div className="glass-card reveal-clash-right" style={{ borderColor: 'rgba(167, 139, 250, 0.3)', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent-violet)', fontWeight: 600, marginBottom: '4px' }}>
                    THEM
                  </div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: 500 }}>
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
