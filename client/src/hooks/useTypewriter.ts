import { useState, useEffect, useRef } from 'react';

/**
 * Progressive text reveal hook — reveals word by word (not character by
 * character) so a full scene reads in under a second, cinema-pace rather
 * than typewriter-pace.
 */
export function useTypewriter(text: string, speed: number = 35, startImmediately: boolean = true): {
  displayText: string;
  isComplete: boolean;
  skip: () => void;
} {
  const words = useRef<string[]>([]);
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!startImmediately || !text) return;

    words.current = text.split(' ');
    indexRef.current = 0;
    setDisplayText('');
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= words.current.length) {
        setDisplayText(text);
        setIsComplete(true);
        clearInterval(intervalRef.current);
      } else {
        setDisplayText(words.current.slice(0, indexRef.current).join(' '));
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
