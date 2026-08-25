import React from 'react';

interface StoryTransitionProps {
  transitionText?: string;
  variant?: 'default' | 'converge';
}

export const StoryTransition: React.FC<StoryTransitionProps> = ({
  transitionText = 'The story is changing...',
  variant = 'default',
}) => {
  return (
    <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: '100%' }}>
        {variant === 'converge' && (
          <div className="converge-visual">
            <div className="converge-bar left" />
            <div className="converge-bar right" />
          </div>
        )}
        <h3 className="font-serif" style={{ color: 'var(--text-cream)', fontWeight: 500, marginBottom: '16px' }}>
          {transitionText}
        </h3>
        <div className="transition-line" />
      </div>
    </div>
  );
};
