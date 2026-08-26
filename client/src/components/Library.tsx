import React, { useMemo, useState } from 'react';
import { Poster } from './ui/Poster';
import { Footer } from './ui/Footer';
import { GoogleSignIn } from './ui/GoogleSignIn';
import type { StoryListItem } from '../hooks/useGame';
import type { AuthUser } from '../hooks/useAuth';

interface LibraryProps {
  displayName: string;
  stories: StoryListItem[];
  onChoose: (story: StoryListItem) => void;
  onAdminClick: () => void;
  onPrivacyClick: () => void;
  authUser: AuthUser | null;
  onGoogleCredential: (credential: string) => void;
  onProfileClick: () => void;
}

const GENRES = ['all', 'mystery', 'horror', 'romance', 'adventure', 'emotional', 'comedy', 'scifi', 'chaos'];

export const Library: React.FC<LibraryProps> = ({
  displayName, stories, onChoose, onAdminClick, onPrivacyClick,
  authUser, onGoogleCredential, onProfileClick,
}) => {
  const [genre, setGenre] = useState('all');

  const filtered = useMemo(
    () => (genre === 'all' ? stories : stories.filter(s => s.genre === genre)),
    [stories, genre],
  );

  return (
    <div className="screen app-container" style={{ maxWidth: '720px', justifyContent: 'flex-start' }}>
      <div className="library-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '12px', flexWrap: 'wrap' }}>
          <div className="eyebrow">Welcome, {displayName || 'storyteller'}</div>
          {authUser ? (
            <button
              onClick={onProfileClick}
              style={{ background: 'none', border: '1px solid color-mix(in oklab, var(--paper) 16%, transparent)', borderRadius: 'var(--radius-full)', color: 'var(--text-cream)', fontSize: '0.75rem', padding: '6px 14px', cursor: 'pointer' }}
            >
              {authUser.displayName} · Profile
            </button>
          ) : (
            <GoogleSignIn onCredential={onGoogleCredential} />
          )}
        </div>
        <h2 style={{ marginBottom: '6px' }}>Pick a story to step into.</h2>
        <p className="text-muted" style={{ fontSize: '0.9375rem', maxWidth: '480px' }}>
          {stories.length || '—'} stories. Every one splits into two paths and brings them back together.
        </p>
      </div>

      <div className="genre-filter-row">
        {GENRES.map(g => (
          <button
            key={g}
            className={`genre-chip ${genre === g ? 'active' : ''}`}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="story-grid">
        {filtered.map((story, i) => (
          <div
            key={story.id}
            className="story-card"
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            onClick={() => onChoose(story)}
          >
            <div className="story-card-poster">
              <span className="story-card-genre">{story.genre}</span>
              <Poster grade={story.grade} title={story.title} />
            </div>
            <div className="story-card-body">
              <div className="story-card-title" style={{ color: 'var(--text-cream)' }}>{story.title}</div>
              <div className="story-card-logline">{story.logline}</div>
              <div className="tone-tags">
                {story.toneTags.slice(0, 3).map(t => (
                  <span key={t} className="tone-tag">{t}</span>
                ))}
                <span className="tone-tag">{story.runtime}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && stories.length > 0 && (
          <p className="text-muted" style={{ padding: '20px 4px' }}>No stories in this mood yet — try another filter.</p>
        )}
      </div>

      <Footer onAdminClick={onAdminClick} onPrivacyClick={onPrivacyClick} />
    </div>
  );
};
