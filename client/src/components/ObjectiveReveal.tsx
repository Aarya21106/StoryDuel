import React from 'react';

interface ObjectiveRevealProps {
  objective: string;
}

export const ObjectiveReveal: React.FC<ObjectiveRevealProps> = ({ objective }) => {
  return (
    <div className="objective-overlay">
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.8125rem', color: 'var(--accent-violet)', marginBottom: '16px', fontWeight: 600 }}>
        🔒 SECRET OBJECTIVE
      </div>

      <div className="objective-text" style={{ color: 'var(--text-cream)', marginBottom: '24px' }}>
        "{objective}"
      </div>

      <p className="text-muted" style={{ fontSize: '0.875rem' }}>
        Only you know this. Shape your choices to make it happen.
      </p>
    </div>
  );
};
