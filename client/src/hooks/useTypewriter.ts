import { useState, useEffect, useRef } from 'react';

/**
 * Progressive text reveal hook. Returns the currently visible substring.
 */
export function useTypewriter(text: string, speed: number = 25, startImmediately: boolean = true): {
  displayText: string;
  isComplete: boolean;
  skip: () => void;
} {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!startImmediately || !text) return;

    indexRef.current = 0;
    setDisplayText('');
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayText(text);
        setIsComplete(true);
        clearInterval(intervalRef.current);
      } else {
        setDisplayText(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [text, speed, startImmediately]);

  const skip = () => {
    clearInterval(intervalRef.current);
    setDisplayText(text);
    setIsComplete(true);
  };

  return { displayText, isComplete, skip };
}
