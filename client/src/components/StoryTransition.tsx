import React from 'react';

interface StoryTransitionProps {
  transitionText?: string;
}

export const StoryTransition: React.FC<StoryTransitionProps> = ({
  transitionText = 'The story is changing...',
}) => {
  return (
    <div className="screen app-container" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: '100%' }}>
        <h3 className="font-display" style={{ color: 'var(--text-cream)', fontWeight: 500, marginBottom: '16px' }}>
          {transitionText}
        </h3>
        <div className="transition-line" />
      </div>
    </div>
  );
};
