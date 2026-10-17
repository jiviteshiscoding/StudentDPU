import React from 'react';

interface ProjexLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  animated?: boolean;
  variant?: 'full' | 'mark';
  className?: string;
  themeColor?: string;
}

export const ProjexLogo: React.FC<ProjexLogoProps> = ({
  size = 'md',
  animated = false,
  variant = 'full',
  className = '',
  themeColor = 'currentColor',
}) => {
  // Dimension scaling
  const getDimensions = () => {
    if (typeof size === 'number') {
      return { width: size, height: variant === 'mark' ? size : Math.round(size * 0.35) };
    }
    switch (size) {
      case 'xs':
        return variant === 'mark' ? { width: 20, height: 20 } : { width: 72, height: 26 };
      case 'sm':
        return variant === 'mark' ? { width: 28, height: 28 } : { width: 100, height: 36 };
      case 'md':
        return variant === 'mark' ? { width: 36, height: 36 } : { width: 130, height: 46 };
      case 'lg':
        return variant === 'mark' ? { width: 48, height: 48 } : { width: 170, height: 60 };
      case 'xl':
        return variant === 'mark' ? { width: 64, height: 64 } : { width: 230, height: 82 };
      default:
        return variant === 'mark' ? { width: 36, height: 36 } : { width: 130, height: 46 };
    }
  };

  const { width, height } = getDimensions();

  // 12 Gear teeth coordinates around the cogwheel
  const gearTeeth = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const rInner = 20;
    const rOuter = 26;
    const x1 = Math.cos(angle - 0.12) * rInner;
    const y1 = Math.sin(angle - 0.12) * rInner;
    const x2 = Math.cos(angle - 0.08) * rOuter;
    const y2 = Math.sin(angle - 0.08) * rOuter;
    const x3 = Math.cos(angle + 0.08) * rOuter;
    const y3 = Math.sin(angle + 0.08) * rOuter;
    const x4 = Math.cos(angle + 0.12) * rInner;
    const y4 = Math.sin(angle + 0.12) * rInner;
    return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4}`;
  }).join(' ');

  // 6 Concentric circular holes on the cog body
  const gearHoles = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    const r = 13;
    const cx = Math.cos(angle) * r;
    const cy = Math.sin(angle) * r;
    return <circle key={i} cx={cx} cy={cy} r={2.5} fill="currentColor" opacity="0.85" />;
  });

  // If mark-only variant (the belt-drive sprocket & pulley linkage)
  if (variant === 'mark') {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 110 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none shrink-0 ${className}`}
        aria-label="PROJEX mark"
      >
        <g transform="translate(10, 10)">
          {/* Drive Belt (smooth pill linking o wheel and j dot) */}
          <path
            d="M 38 60 L 74 24 A 9 9 0 0 1 86 36 L 50 72 A 34 34 0 0 1 38 60 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Pulley at J Dot */}
          <circle cx="80" cy="30" r="6" fill="currentColor" />

          {/* Wheel 'o' outer ring */}
          <circle cx="44" cy="66" r="30" stroke="currentColor" strokeWidth="3.4" fill="none" />

          {/* Rotating Cogwheel inside 'o' */}
          <g
            transform="translate(44, 66)"
            className={animated ? 'motion-safe:animate-[spin_4s_linear_infinite] origin-center' : ''}
          >
            {/* Gear teeth */}
            <path d={gearTeeth} stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Inner rim */}
            <circle cx="0" cy="0" r="19" stroke="currentColor" strokeWidth="2" fill="none" />
            {/* Concentric holes */}
            {gearHoles}
            {/* Center axle hub */}
            <circle cx="0" cy="0" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="0" cy="0" r="2.5" fill="currentColor" />
          </g>
        </g>
      </svg>
    );
  }

  // Full Wordmark variant matching the video: "Projex" with mechanical belt-drive between o and j
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 460 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
      aria-label="PROJEX Logo"
    >
      {/* Letter 'P' */}
      <path
        d="M 44 140 L 44 45 M 44 45 L 75 45 C 96 45 96 95 75 95 L 44 95"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'r' */}
      <path
        d="M 125 140 L 125 78 M 125 96 C 133 80 152 74 162 82"
        stroke="currentColor"
        strokeWidth="8.5"
        strokeLinecap="round"
      />

      {/* Belt-Drive Linkage between 'o' and 'j' */}
      {/* Drive Belt Loop: wraps around outer 'o' circle and top pulley of 'j' */}
      <path
        d="M 206 82 L 273 42 A 12 12 0 0 1 285 58 L 243 118"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Outer Circle of 'o' */}
      <circle cx="216" cy="108" r="36" stroke="currentColor" strokeWidth="8" fill="none" />

      {/* Rotating Mechanical Cogwheel inside 'o' */}
      <g
        transform="translate(216, 108)"
        className={animated ? 'motion-safe:animate-[spin_4s_linear_infinite] origin-center' : ''}
        style={{ transformOrigin: '216px 108px' }}
      >
        {/* Teeth */}
        <path d={gearTeeth} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Gear body rim */}
        <circle cx="0" cy="0" r="19" stroke="currentColor" strokeWidth="2.2" fill="none" />
        {/* Circular punch holes */}
        {gearHoles}
        {/* Center hub */}
        <circle cx="0" cy="0" r="6" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <circle cx="0" cy="0" r="2.5" fill="currentColor" />
      </g>

      {/* Letter 'j' */}
      {/* Top Pulley Bearing (j dot inside the belt loop) */}
      <circle cx="279" cy="50" r="7.5" fill="currentColor" />
      {/* Lower Stem and Hook of 'j' */}
      <path
        d="M 279 80 L 279 135 C 279 162 254 165 242 155"
        stroke="currentColor"
        strokeWidth="8.5"
        strokeLinecap="round"
      />

      {/* Letter 'e' */}
      <path
        d="M 320 110 L 362 110 C 362 82 320 82 320 110 C 320 138 362 140 366 128"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Letter 'x' */}
      <path
        d="M 388 80 L 442 140 M 442 80 L 388 140"
        stroke="currentColor"
        strokeWidth="8.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
