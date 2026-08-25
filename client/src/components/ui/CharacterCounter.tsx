import React from 'react';

interface CharacterCounterProps {
  current: number;
  max?: number;
  min?: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max = 150,
  min = 20,
}) => {
  const isNearMax = current > max - 15;
  const isBelowMin = current < min;

  return (
    <div
      className="font-mono"
      style={{
        fontSize: '0.75rem',
        textAlign: 'right',
        color: isNearMax ? 'var(--danger)' : isBelowMin ? 'var(--text-dim)' : 'var(--text-muted)',
        transition: 'color 0.2s',
      }}
    >
      {current} / {max} {isBelowMin && `(min ${min})`}
    </div>
  );
};
