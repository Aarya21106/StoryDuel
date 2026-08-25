import React, { useState, useEffect } from 'react';
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

export const FinalReveal: React.FC<FinalRevealProps> = ({
  data,
  myDisplayName,
  onGuessPartner,
  guessResult,
  onPlayAgain,
  onInviteFriend,
  onReport,
}) => {
  const [step, setStep] = useState<number>(1);

  // Auto-advance or allow user to scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="screen app-container" style={{ justifyContent: 'flex-start', paddingBottom: '60px' }}>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent-coral)', fontWeight: 600, marginBottom: '6px' }}>
            STORY COMPLETE
          </div>
          <h2>The Grand Reveal</h2>
        </div>

        {/* 1. Story Replay Timeline */}
        <div className="glass-card" style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '16px' }}>
            STORY TIMELINE
          </div>

          <div className="timeline">
            {data.transcript.map((t, i) => (
              <div key={i} className="timeline-item" style={{ animationDelay: `${i * 120}ms` }}>
                <div className={`timeline-dot ${t.matched ? 'match' : 'clash'}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {t.scene}
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    <span style={{ color: 'var(--accent-coral)' }}>You: "{t.yourChoice}"</span>
                    <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>/</span>
                    <span style={{ color: 'var(--accent-violet)' }}>Them: "{t.theirChoice}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Match Moments Stats */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '36px' }}>
          <div>
            <div className="font-display text-gold" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {data.matchCount}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Same Brain
            </div>
          </div>

          <div style={{ width: '1px', background: 'rgba(245, 240, 232, 0.1)' }} />

          <div>
            <div className="font-display text-violet" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              {data.clashCount}
            </div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Different Paths
            </div>
          </div>
        </div>

        {/* 3. Secret Objectives Reveal */}
        <div className="glass-card" style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '16px' }}>
            SECRET OBJECTIVES
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent-coral)', fontWeight: 600, marginBottom: '4px' }}>
              YOUR SECRET
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>
              "{data.objectives.yours}"
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent-violet)', fontWeight: 600, marginBottom: '4px' }}>
              THEIR SECRET
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>
              "{data.objectives.theirs}"
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid rgba(245, 240, 232, 0.05)', paddingTop: '12px' }}>
            Did you two accidentally help each other?
          </div>
        </div>

        {/* 4. Story Chemistry Score & Insight */}
        <ChemistryScore
          score={data.chemistryScore}
          insight={data.insight}
          breakdown={data.breakdown}
        />

        {/* 5. Human or AI Guess */}
        <HumanOrAI onGuess={onGuessPartner} guessResult={guessResult} />

        {/* 6. Share Card */}
        <ShareCard
          sessionId={data.sessionId}
          myDisplayName={myDisplayName}
          partnerName={data.partnerName}
          chemistryScore={data.chemistryScore}
        />

        {/* 7. Replay / CTA */}
        <ReplayPrompt
          onPlayAgain={onPlayAgain}
          onInviteFriend={onInviteFriend}
          onReport={onReport}
        />
      </div>
    </div>
  );
};
