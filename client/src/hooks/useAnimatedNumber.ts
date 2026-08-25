import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to target using requestAnimationFrame.
 * Returns the current animated value.
 */
export function useAnimatedNumber(target: number, duration: number = 2000, start: boolean = true): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!start || target === 0) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Deceleration easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTimeRef.current = undefined;
    };
  }, [target, duration, start]);

  return value;
}
