import React from 'react';
import { Poster } from './ui/Poster';
import { PulseButton } from './ui/PulseButton';
import type { StoryListItem } from '../hooks/useGame';

interface StoryDetailProps {
  story: StoryListItem;
  onBack: () => void;
  onPlayStranger: () => void;
  onPlayNarrator: () => void;
  onInviteFriend: () => void;
}

export const StoryDetail: React.FC<StoryDetailProps> = ({
  story,
  onBack,
  onPlayStranger,
  onPlayNarrator,
  onInviteFriend,
}) => {
  return (
    <div className="screen app-container" style={{ justifyContent: 'flex-start' }}>
      <div style={{ width: '100%' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8125rem', marginBottom: '16px', padding: 0 }}
        >
          ← All stories
        </button>

        <div className="detail-poster">
          <Poster grade={story.grade} title={story.title} />
          <div className="detail-poster-title">
            <div className="eyebrow" style={{ color: story.grade.accent, marginBottom: '4px' }}>{story.genre} · {story.runtime}</div>
            <h2 style={{ color: '#fff' }}>{story.title}</h2>
          </div>
        </div>

        <p style={{ fontSize: '1.0625rem', lineHeight: 1.6, fontFamily: 'var(--font-serif)', color: 'var(--text-cream)', marginBottom: '4px' }}>
          {story.synopsis}
        </p>

        <div className="tone-tags" style={{ marginTop: '14px', marginBottom: '20px' }}>
          {story.toneTags.map(t => <span key={t} className="tone-tag">{t}</span>)}
        </div>

        <div className="glass-card" style={{ marginBottom: '28px' }}>
          <div className="eyebrow" style={{ marginBottom: '8px' }}>How this one plays</div>
          <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>
            You'll open the story together, then walk apart for two beats — what you choose there, they never see until the end. Then your paths cross again, and you close the story side by side.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '20px' }}>
          <PulseButton variant="primary" onClick={onPlayStranger}>
            Play with someone new
          </PulseButton>
          <PulseButton variant="secondary" onClick={onInviteFriend}>
            Invite a friend
          </PulseButton>
          <PulseButton variant="ghost" onClick={onPlayNarrator}>
            Play with the Narrator (AI co-lead)
          </PulseButton>
        </div>
      </div>
    </div>
  );
};
