import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ParticleBurstProps {
  trigger: boolean;
  colorType?: 'gold' | 'coral' | 'all';
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({ trigger, colorType = 'gold' }) => {
  useEffect(() => {
    if (!trigger) return;

    const colors =
      colorType === 'gold'
        ? ['#F5C542', '#FFD700', '#F5F0E8', '#FF6B4A']
        : colorType === 'coral'
        ? ['#FF6B4A', '#A78BFA', '#4AEADC', '#F5F0E8']
        : ['#FF6B4A', '#A78BFA', '#F5C542', '#4AEADC'];

    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      ticks: 200,
      gravity: 1.2,
      decay: 0.94,
      startVelocity: 30,
      disableForReducedMotion: true,
    });
  }, [trigger, colorType]);

  return null;
};
