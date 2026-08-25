import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 22,
  className = '',
  onComplete,
}) => {
  const { displayText, isComplete, skip } = useTypewriter(text, speed);

  React.useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className={`typewriter-container ${className}`} onClick={skip} title="Click to reveal text instantly" style={{ cursor: 'pointer' }}>
      <p style={{ display: 'inline', whiteSpace: 'pre-line' }}>
        {displayText}
        {!isComplete && <span className="typewriter-cursor" />}
      </p>
    </div>
  );
};
