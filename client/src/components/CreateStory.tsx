import React, { useState } from 'react';
import { PulseButton } from './ui/PulseButton';
import { GoogleSignIn } from './ui/GoogleSignIn';
import { API_BASE_URL } from '../config';
import type { AuthUser } from '../hooks/useAuth';

interface CreateStoryProps {
  authUser: AuthUser | null;
  token: string | null;
  onGoogleCredential: (credential: string) => void;
  onBack: () => void;
  onCreated: (storyId: string) => void;
}

const GENRES = ['mystery', 'horror', 'romance', 'adventure', 'emotional', 'comedy', 'scifi', 'chaos'];
const LENGTHS = [
  { label: '10 min', rounds: 6 },
  { label: '20 min', rounds: 12 },
  { label: '30 min', rounds: 20 },
];

export const CreateStory: React.FC<CreateStoryProps> = ({ authUser, token, onGoogleCredential, onBack, onCreated }) => {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('mystery');
  const [rounds, setRounds] = useState(6);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!token) return;
    if (prompt.trim().length < 10) {
      setError('Tell us a bit more about the story you want.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/stories/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: prompt.trim(), genre, lengthRounds: rounds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create story');
      onCreated(data.story.id);
    } catch (e: any) {
      setError(e.message || 'Failed to create story');
    } finally {
      setCreating(false);
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

        <div className="eyebrow" style={{ marginBottom: '8px' }}>Create a story</div>
        <h2 style={{ marginBottom: '10px' }}>What's the premise?</h2>

        {!authUser ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.9375rem' }}>
              Sign in to create and keep your own stories.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleSignIn onCredential={onGoogleCredential} />
            </div>
          </div>
        ) : (
          <>
            <p className="text-muted" style={{ fontSize: '0.9375rem', marginBottom: '24px' }}>
              Describe the situation, who's in it, what's at stake. We'll turn it into an opening scene,
              two characters, and a starting mood — then it plays exactly like every other story here:
              your paths split, then cross again.
            </p>

            <textarea
              className="textarea-write"
              placeholder="e.g. Two rival chefs get locked in a restaurant kitchen after hours, and something in the walk-in freezer isn't food..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              maxLength={600}
              rows={5}
              style={{ marginBottom: '20px', fontFamily: 'var(--font-body)', fontSize: '0.9375rem' }}
            />

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Genre</label>
              <div className="genre-filter-row" style={{ paddingBottom: '4px' }}>
                {GENRES.map(g => (
                  <button key={g} className={`genre-chip ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Length</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {LENGTHS.map(l => (
                  <button
                    key={l.rounds}
                    onClick={() => setRounds(l.rounds)}
                    className="btn"
                    style={{
                      flex: 1,
                      background: rounds === l.rounds ? 'var(--accent)' : 'transparent',
                      color: rounds === l.rounds ? 'var(--ink)' : 'var(--text-cream)',
                      border: '1px solid ' + (rounds === l.rounds ? 'var(--accent)' : 'color-mix(in oklab, var(--paper) 20%, transparent)'),
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.8125rem', marginBottom: '16px' }}>{error}</div>
            )}

            <PulseButton variant="primary" onClick={handleCreate} disabled={creating}>
              {creating ? 'Building your story…' : 'Create story'}
            </PulseButton>
          </>
        )}
      </div>
    </div>
  );
};
