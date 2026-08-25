import React from 'react';
import type { StoryGrade } from '../../hooks/useGame';

interface PosterProps {
  grade: StoryGrade;
  title: string;
  style?: React.CSSProperties;
}

/**
 * Deterministic, zero-asset poster: a per-story gradient mesh in the
 * story's own color grade, with a large faded initial letter.
 */
export const Poster: React.FC<PosterProps> = ({ grade, title, style }) => {
  const initial = title.trim().charAt(0).toUpperCase();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: `radial-gradient(130% 150% at 12% -10%, ${grade.accent}4D 0%, transparent 55%), radial-gradient(110% 130% at 100% 120%, ${grade.accent}33 0%, transparent 50%), ${grade.ink}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '6rem',
          color: grade.accent,
          opacity: 0.26,
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {initial}
      </span>
    </div>
  );
};
