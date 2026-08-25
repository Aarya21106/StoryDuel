import React, { useEffect, useState } from 'react';
import type { StoryBriefData } from '../hooks/useGame';

interface BriefingProps {
  brief: StoryBriefData;
  onBegin: () => void;
}

const STEP_COUNT = 5;

export const Briefing: React.FC<BriefingProps> = ({ brief, onBegin }) => {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setStep(0);
    setConfirmed(false);
  }, [brief.title]);

  const next = () => {
    if (step < STEP_COUNT - 1) setStep(s => s + 1);
  };

  const handleBegin = () => {
    if (confirmed) return;
    setConfirmed(true);
    onBegin();
  };

  return (
    <div className="briefing-container" onClick={step < STEP_COUNT - 1 ? next : undefined}>
      <div className="briefing-progress">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <div key={i} className={`seg ${i <= step ? 'done' : ''}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="briefing-card" key="0">
          <div className="eyebrow" style={{ marginBottom: '14px' }}>A StoryDuel Original</div>
          <h1 style={{ marginBottom: '10px' }}>{brief.title}</h1>
          <p className="text-muted" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.0625rem' }}>
            {brief.toneTags.join(' · ')}
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="briefing-card" key="1">
          <div className="eyebrow" style={{ marginBottom: '16px' }}>The Situation</div>
          <p className="scene-text">{brief.synopsis}</p>
        </div>
      )}

      {step === 2 && (
        <div className="briefing-card" key="2">
          <div className="eyebrow" style={{ marginBottom: '16px' }}>Who You Are</div>
          <h2 style={{ marginBottom: '6px' }}>{brief.you.name}</h2>
          <p className="text-muted" style={{ marginBottom: '4px' }}>{brief.you.role}</p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.0625rem', marginTop: '10px' }}>
            You want {brief.you.want}.
          </p>
          <div className="briefing-secret">
            <div className="eyebrow" style={{ marginBottom: '6px' }}>Only you know this</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.0625rem', fontStyle: 'italic' }}>
              "{brief.you.secret}"
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="briefing-card" key="3">
          <div className="eyebrow" style={{ marginBottom: '16px' }}>Who They Are</div>
          <h2 style={{ marginBottom: '6px' }}>{brief.them.name}</h2>
          <p className="text-muted" style={{ marginBottom: '4px' }}>{brief.them.role}</p>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.0625rem', marginTop: '10px' }}>
            As far as you know, they want {brief.them.want}.
          </p>
          <p className="text-dim" style={{ marginTop: '16px', fontSize: '0.8125rem' }}>
            They're carrying a secret of their own. You won't find out what it is until the story's over.
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="briefing-card" key="4">
          <div className="eyebrow" style={{ marginBottom: '16px' }}>Before You Begin</div>
          <p className="scene-text" style={{ marginBottom: '14px' }}>
            You won't always be in the same room. What you choose changes what they see — and what they choose changes what you see.
          </p>
          <p className="scene-text" style={{ marginBottom: '32px' }}>
            You will meet again before the story ends.
          </p>
          <button
            className="btn btn-primary"
            onClick={(e) => { e.stopPropagation(); handleBegin(); }}
            disabled={confirmed}
          >
            {confirmed ? 'Entering the story…' : 'Begin'}
          </button>
        </div>
      )}

      {step < STEP_COUNT - 1 && <div className="briefing-tap-hint">Tap to continue</div>}
    </div>
  );
};
