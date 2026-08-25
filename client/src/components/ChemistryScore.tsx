import React, { useState } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import type { DimensionBreakdown } from '../hooks/useGame';

interface ChemistryScoreProps {
  score: number;
  insight: string;
  breakdown: DimensionBreakdown;
}

export const ChemistryScore: React.FC<ChemistryScoreProps> = ({ score, insight, breakdown }) => {
  const animatedScore = useAnimatedNumber(score, 1600, true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '36px', position: 'relative' }}>
      {score >= 70 && <div className="glow-pulse" />}

      <div className={`chemistry-score ${score >= 70 ? 'glow' : ''}`}>
        {animatedScore}%
      </div>
      <div className="chemistry-label">Story Synergy</div>

      <div className="glass-card" style={{ marginTop: '24px', textAlign: 'left', borderColor: 'var(--accent-soft)' }}>
        <div className="eyebrow" style={{ marginBottom: '8px' }}>The closing line</div>
        <p style={{ fontSize: '1.0625rem', lineHeight: '1.55', color: 'var(--text-cream)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          "{insight}"
        </p>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={() => setShowBreakdown((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
            padding: '6px 12px',
          }}
        >
          {showBreakdown ? 'Hide the breakdown' : 'See the breakdown'}
        </button>

        {showBreakdown && (
          <div className="glass-card stagger" style={{ marginTop: '12px', textAlign: 'left' }}>
            <div className="breakdown-item">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>In sync</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.sync}%</span>
            </div>
            <div className="breakdown-item">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Boldness</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.risk}%</span>
            </div>
            <div className="breakdown-item">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Trust</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.trust}%</span>
            </div>
            <div className="breakdown-item" style={{ borderBottom: 'none' }}>
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Story pull</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.direction}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
