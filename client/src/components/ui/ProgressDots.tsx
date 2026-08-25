import React from 'react';

interface ProgressDotsProps {
  currentRound: number;
  totalRounds: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ currentRound, totalRounds }) => {
  return (
    <div className="progress-dots" aria-label={`Round ${currentRound} of ${totalRounds}`}>
      {Array.from({ length: totalRounds }).map((_, i) => {
        const roundNum = i + 1;
        let className = 'progress-dot';
        if (roundNum === currentRound) {
          className += ' active';
        } else if (roundNum < currentRound) {
          className += ' completed';
        }
        return <div key={i} className={className} />;
      })}
    </div>
  );
};
