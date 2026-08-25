import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  locked?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
  locked = false,
  style,
}) => {
  let classes = 'glass-card';
  if (selected) classes += ' selected';
  if (locked) classes += ' locked';
  if (className) classes += ` ${className}`;

  return (
    <div className={classes} onClick={onClick} style={style}>
      {children}
    </div>
  );
};
