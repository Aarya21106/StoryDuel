import React, { useState, useEffect } from 'react';

const SUBTEXTS = [
  'Someone is out there.',
  'Finding your co-author...',
  'Connecting your stories...',
  'Almost ready.',
  'This is going to be interesting.',
];

export const Matching: React.FC = () => {
  const [subtextIndex, setSubtextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtextIndex((prev) => (prev + 1) % SUBTEXTS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="screen app-container" style={{ textAlign: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%' }}>
        <div className="orbit-container" style={{ marginBottom: '40px' }}>
          <div className="orbit-dot" />
          <div className="orbit-dot" />
          <div className="orbit-dot" />
        </div>

        <h2 style={{ marginBottom: '16px' }}>Entering the story...</h2>

        <p
          key={subtextIndex}
          className="text-muted"
          style={{
            fontSize: '1rem',
            minHeight: '24px',
            animation: 'screenFadeIn 0.5s var(--ease-out)',
          }}
        >
          {SUBTEXTS[subtextIndex]}
        </p>
      </div>
    </div>
  );
};
