import React, { useEffect, useState } from 'react';
import { Poster } from './ui/Poster';
import { PulseButton } from './ui/PulseButton';
import { API_BASE_URL } from '../config';
import type { StoryListItem } from '../hooks/useGame';

interface MyStoriesProps {
  token: string;
  onBack: () => void;
  onPlay: (story: StoryListItem) => void;
  onCreateNew: () => void;
}

export const MyStories: React.FC<MyStoriesProps> = ({ token, onBack, onPlay, onCreateNew }) => {
  const [stories, setStories] = useState<StoryListItem[] | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stories/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setStories(data.stories || []))
      .catch(() => setStories([]));
  }, [token]);

  return (
    <div className="screen app-container" style={{ maxWidth: '720px', justifyContent: 'flex-start' }}>
      <div style={{ width: '100%' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '20px', padding: 0 }}
        >
          ← Back
        </button>

        <div className="eyebrow" style={{ marginBottom: '8px' }}>Your stories</div>
        <h2 style={{ marginBottom: '20px' }}>Stories you've created</h2>

        {stories === null && <p className="text-muted">Loading…</p>}

        {stories?.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: '20px' }}>
            <p className="text-muted" style={{ marginBottom: '16px' }}>You haven't created a story yet.</p>
            <PulseButton variant="primary" onClick={onCreateNew}>Create your first story</PulseButton>
          </div>
        )}

        {stories && stories.length > 0 && (
          <>
            <div className="story-grid" style={{ marginBottom: '24px' }}>
              {stories.map((story, i) => (
                <div
                  key={story.id}
                  className="story-card"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  onClick={() => onPlay(story)}
                >
                  <div className="story-card-poster">
                    <span className="story-card-genre">{story.genre}</span>
                    <Poster grade={story.grade} title={story.title} />
                  </div>
                  <div className="story-card-body">
                    <div className="story-card-title" style={{ color: 'var(--text-cream)' }}>{story.title}</div>
                    <div className="story-card-logline">{story.logline}</div>
                    <div className="tone-tags">
                      <span className="tone-tag">{story.runtime}</span>
                      <span className="tone-tag">private</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <PulseButton variant="secondary" onClick={onCreateNew}>Create another story</PulseButton>
          </>
        )}
      </div>
    </div>
  );
};
