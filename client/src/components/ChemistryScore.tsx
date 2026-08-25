import React, { useState } from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { ParticleBurst } from './ui/ParticleBurst';
import type { DimensionBreakdown } from '../hooks/useGame';

interface ChemistryScoreProps {
  score: number;
  insight: string;
  breakdown: DimensionBreakdown;
}

export const ChemistryScore: React.FC<ChemistryScoreProps> = ({ score, insight, breakdown }) => {
  const animatedScore = useAnimatedNumber(score, 1800, true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '36px' }}>
      <ParticleBurst trigger={score >= 70} colorType="all" />

      <div className={`chemistry-score ${score >= 70 ? 'glow' : ''}`}>
        {animatedScore}%
      </div>
      <div className="chemistry-label">Story Chemistry</div>

      <div className="glass-card" style={{ marginTop: '24px', textAlign: 'left', borderColor: 'rgba(255, 107, 74, 0.2)' }}>
        <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--accent-coral)', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '6px' }}>
          AI INSIGHT
        </div>
        <p style={{ fontSize: '0.9375rem', lineHeight: '1.5', color: 'var(--text-cream)' }}>
          "{insight}"
        </p>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={() => setShowBreakdown((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-violet)',
            cursor: 'pointer',
            fontSize: '0.8125rem',
            fontWeight: 500,
            padding: '6px 12px',
          }}
        >
          {showBreakdown ? 'Hide breakdown ↑' : 'See breakdown →'}
        </button>

        {showBreakdown && (
          <div className="glass-card stagger" style={{ marginTop: '12px', textAlign: 'left' }}>
            <div className="breakdown-item">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Decision Sync</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.sync}%</span>
            </div>
            <div className="breakdown-item">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Risk Taking</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.risk}%</span>
            </div>
            <div className="breakdown-item">
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Trust Level</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.trust}%</span>
            </div>
            <div className="breakdown-item" style={{ borderBottom: 'none' }}>
              <span className="text-muted" style={{ fontSize: '0.8125rem' }}>Plot Alignment</span>
              <span className="font-mono" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{breakdown.direction}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
