import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  initialCount?: number;
  onComplete: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialCount = 3, onComplete }) => {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 650);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count <= 0) return null;

  return (
    <div key={count} className="countdown-number" aria-live="polite">
      {count}
    </div>
  );
};
