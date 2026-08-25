import React, { useEffect } from 'react';
import { ChemistryScore } from './ChemistryScore';
import { HumanOrAI } from './HumanOrAI';
import { ShareCard } from './ShareCard';
import { ReplayPrompt } from './ReplayPrompt';
import type { SessionCompleteData, GuessResultData } from '../hooks/useGame';

interface FinalRevealProps {
  data: SessionCompleteData;
  myDisplayName: string;
  onGuessPartner: (guess: 'human' | 'ai') => void;
  guessResult: GuessResultData | null;
  onPlayAgain: () => void;
  onInviteFriend: () => void;
  onReport: () => void;
}

const BEAT_LABEL: Record<string, string> = {
  shared: 'Together',
  convergence: 'Paths crossed again',
  solo: 'While you were apart',
};

export const FinalReveal: React.FC<FinalRevealProps> = ({
  data,
  myDisplayName,
  onGuessPartner,
  guessResult,
  onPlayAgain,
  onInviteFriend,
  onReport,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="screen app-container" style={{ justifyContent: 'flex-start', paddingBottom: '60px' }}>
      <div style={{ width: '100%' }}>
        {/* Title Card */}
        <div className="credits-title-card credits-block">
          <span className="eyebrow">The story is complete</span>
          <h1 style={{ marginTop: '10px', marginBottom: '10px' }}>{data.storyTitle}</h1>
          <p className="text-muted" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.0625rem' }}>
            written by {myDisplayName} &amp; {data.partnerName}
          </p>
        </div>

        <div className="credits-divider" />

        {/* Story Timeline — includes the solo-lane reveal */}
        <div className="glass-card credits-block" style={{ marginBottom: '36px', animationDelay: '120ms' }}>
          <div className="eyebrow" style={{ marginBottom: '16px' }}>How it unfolded</div>

          <div className="timeline">
            {data.transcript.map((t, i) => (
              <div key={i} className="timeline-item" style={{ animationDelay: `${i * 110}ms` }}>
                <div className={`timeline-dot ${t.beatKind === 'solo' ? 'solo' : t.matched ? 'match' : 'clash'}`} />
                <div style={{ flex: 1 }}>
                  <div className="font-mono text-dim" style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    {BEAT_LABEL[t.beatKind] || 'Together'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {t.yourScene}
                  </div>
                  {t.beatKind === 'solo' ? (
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      <div style={{ color: 'var(--accent)', marginBottom: '4px' }}>You: "{t.yourChoice}"</div>
                      {t.theirChoice && (
                        <div style={{ color: 'var(--text-muted)' }}>Meanwhile, them: "{t.theirChoice}"</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      <span style={{ color: 'var(--accent)' }}>You: "{t.yourChoice}"</span>
                      {t.theirChoice && (
                        <>
                          <span className="text-dim" style={{ margin: '0 6px' }}>/</span>
                          <span className="text-muted">Them: "{t.theirChoice}"</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Match Moments Stats */}
        <div className="glass-card credits-block" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '36px', animationDelay: '180ms' }}>
          <div>
            <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--accent)' }}>
              {data.matchCount}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Same moment
            </div>
          </div>

          <div style={{ width: '1px', background: 'color-mix(in oklab, var(--paper) 10%, transparent)' }} />

          <div>
            <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-cream)' }}>
              {data.clashCount}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Different paths
            </div>
          </div>
        </div>

        {/* Secret Objectives Reveal */}
        <div className="glass-card credits-block" style={{ marginBottom: '36px', animationDelay: '240ms' }}>
          <div className="eyebrow" style={{ marginBottom: '16px' }}>What you were each secretly chasing</div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px' }}>
              Your secret
            </div>
            <div style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)' }}>
              "{data.objectives.yours}"
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
              Their secret
            </div>
            <div style={{ fontSize: '1rem', fontFamily: 'var(--font-serif)' }}>
              "{data.objectives.theirs}"
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid color-mix(in oklab, var(--paper) 6%, transparent)', paddingTop: '12px' }}>
            Did you two accidentally help each other get there?
          </div>
        </div>

        {/* Story Synergy Score & Insight */}
        <ChemistryScore
          score={data.chemistryScore}
          insight={data.insight}
          breakdown={data.breakdown}
        />

        {/* Human or AI Guess */}
        <HumanOrAI onGuess={onGuessPartner} guessResult={guessResult} />

        {/* Share Card */}
        <ShareCard
          sessionId={data.sessionId}
          myDisplayName={myDisplayName}
          partnerName={data.partnerName}
          storyTitle={data.storyTitle}
          chemistryScore={data.chemistryScore}
        />

        {/* Replay / CTA */}
        <ReplayPrompt
          onPlayAgain={onPlayAgain}
          onInviteFriend={onInviteFriend}
          onReport={onReport}
        />
      </div>
    </div>
  );
};
