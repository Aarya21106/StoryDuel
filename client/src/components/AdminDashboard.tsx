import React, { useState, useEffect } from 'react';
import { PulseButton } from './ui/PulseButton';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or failed');
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <div className="waiting-indicator" style={{ justifyContent: 'center' }}>
          <div className="waiting-dot" />
          <span>Loading admin analytics...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Error Loading Stats</h3>
        <p className="text-muted" style={{ marginBottom: '24px' }}>{error}</p>
        <PulseButton variant="secondary" onClick={onLogout}>
          LOG OUT
        </PulseButton>
      </div>
    );
  }

  const { overview, funnel, engagement, matching, guessAccuracy, system, stories } = stats;

  return (
    <div className="screen app-container" style={{ maxWidth: '640px', justifyContent: 'flex-start', paddingBottom: '60px' }}>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-coral)', fontWeight: 600 }}>
              TELEMETRY & ANALYTICS
            </div>
            <h2>StoryDuel Admin</h2>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid var(--text-dim)',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Exit
          </button>
        </div>

        {/* Overview Stats */}
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Sessions Overview</h4>
        <div className="admin-grid" style={{ marginBottom: '28px' }}>
          <div className="admin-stat">
            <div className="label">Total Sessions</div>
            <div className="value text-coral">{overview.total}</div>
          </div>
          <div className="admin-stat">
            <div className="label">Sessions Today</div>
            <div className="value">{overview.today}</div>
          </div>
          <div className="admin-stat">
            <div className="label">This Week</div>
            <div className="value">{overview.week}</div>
          </div>
          <div className="admin-stat">
            <div className="label">Stranger / Friend Split</div>
            <div className="value text-violet">{overview.stranger} / {overview.friend}</div>
          </div>
        </div>

        {/* Funnel Metrics */}
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Conversion Funnel</h4>
        <div className="glass-card" style={{ marginBottom: '28px' }}>
          <div className="breakdown-item">
            <span className="text-muted">1. Matched</span>
            <span className="font-mono">{funnel.match || 0}</span>
          </div>
          <div className="breakdown-item">
            <span className="text-muted">2. Started</span>
            <span className="font-mono">{funnel.started || 0}</span>
          </div>
          <div className="breakdown-item">
            <span className="text-muted">3. Completed</span>
            <span className="font-mono text-gold">{funnel.completed || 0}</span>
          </div>
          <div className="breakdown-item">
            <span className="text-muted">4. Replay</span>
            <span className="font-mono text-coral">{funnel.replay || 0}</span>
          </div>
          <div className="breakdown-item" style={{ borderBottom: 'none' }}>
            <span className="text-muted">Completion Rate</span>
            <span className="font-mono text-neon">{engagement.completionRate}%</span>
          </div>
        </div>

        {/* Engagement & Chemistry */}
        <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Engagement & System</h4>
        <div className="admin-grid" style={{ marginBottom: '28px' }}>
          <div className="admin-stat">
            <div className="label">Avg Chemistry Score</div>
            <div className="value text-gold">{engagement.avgChemistry}%</div>
          </div>
          <div className="admin-stat">
            <div className="label">AI Undercover Rate</div>
            <div className="value">{matching.aiRate}%</div>
          </div>
          <div className="admin-stat">
            <div className="label">Human/AI Guess Accuracy</div>
            <div className="value">{guessAccuracy.rate}% ({guessAccuracy.correct}/{guessAccuracy.total})</div>
          </div>
          <div className="admin-stat">
            <div className="label">Fallback / Mod Triggers</div>
            <div className="value text-dim">{system.fallbacks} / {system.moderationFlags}</div>
          </div>
        </div>

        {/* Story Scenarios Popularity */}
        {stories && stories.length > 0 && (
          <>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Scenarios Completed</h4>
            <div className="glass-card">
              {stories.map((s: any, i: number) => (
                <div key={i} className="breakdown-item" style={{ borderBottom: i === stories.length - 1 ? 'none' : undefined }}>
                  <span className="text-muted">{s.scenario_id}</span>
                  <span className="font-mono">{s.count} plays</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
