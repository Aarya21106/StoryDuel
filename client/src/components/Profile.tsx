import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import type { AuthUser, PlayHistoryItem } from '../hooks/useAuth';

interface ProfileProps {
  user: AuthUser;
  history: PlayHistoryItem[];
  onBack: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
  onMyStories: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, history, onBack, onSignOut, onDeleteAccount, onMyStories }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteAccount();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="screen app-container" style={{ justifyContent: 'flex-start' }}>
      <div style={{ width: '100%' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '20px', padding: 0 }}
        >
          ← Back to library
        </button>

        <div className="eyebrow" style={{ marginBottom: '8px' }}>Your account</div>
        <h2 style={{ marginBottom: '4px' }}>{user.displayName}</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '28px' }}>
          {user.tier === 'paid' ? 'Paid plan' : 'Free plan'}
        </p>

        <div className="glass-card" style={{ marginBottom: '28px' }}>
          <div className="eyebrow" style={{ marginBottom: '14px' }}>Story history</div>
          {history.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>
              Nothing yet — play a story and it'll show up here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {history.map((h) => (
                <div key={h.sessionId} style={{ borderBottom: '1px solid color-mix(in oklab, var(--paper) 6%, transparent)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>{h.storyId.replace(/-/g, ' ')}</span>
                    {h.chemistryScore !== null && (
                      <span className="font-mono" style={{ color: 'var(--accent)', fontSize: '0.8125rem' }}>{h.chemistryScore}%</span>
                    )}
                  </div>
                  <div className="text-dim" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                    {new Date(h.playedAt).toLocaleDateString()} · {h.mode} · {h.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PulseButton variant="primary" onClick={onMyStories}>
            Your created stories
          </PulseButton>
          <PulseButton variant="secondary" onClick={onSignOut}>
            Sign out
          </PulseButton>

          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8125rem', cursor: 'pointer', padding: '8px' }}
            >
              Delete my account
            </button>
          ) : (
            <div className="glass-card" style={{ borderColor: 'var(--danger)' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '14px' }}>
                This permanently deletes your account. Your name is removed from any shared story history —
                the stories themselves stay so the people you played with keep theirs. This can't be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <PulseButton variant="secondary" onClick={() => setConfirmingDelete(false)}>
                  Keep my account
                </PulseButton>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn"
                  style={{ background: 'var(--danger)', color: '#fff', flex: 1 }}
                >
                  {deleting ? 'Deleting…' : 'Yes, delete it'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
