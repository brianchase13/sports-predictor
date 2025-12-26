'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceRingProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  sublabel?: string;
  color?: string;
  className?: string;
  animated?: boolean;
}

const sizes = {
  sm: { ring: 80, stroke: 6, fontSize: 'text-lg', sublabelSize: 'text-xs' },
  md: { ring: 120, stroke: 8, fontSize: 'text-2xl', sublabelSize: 'text-sm' },
  lg: { ring: 160, stroke: 10, fontSize: 'text-4xl', sublabelSize: 'text-base' },
};

function getColorFromConfidence(value: number): string {
  if (value >= 75) return '#22c55e'; // green-500
  if (value >= 60) return '#eab308'; // yellow-500
  if (value >= 45) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

export function ConfidenceRing({
  value,
  size = 'md',
  label,
  sublabel,
  color,
  className,
  animated = true,
}: ConfidenceRingProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { ring, stroke, fontSize, sublabelSize } = sizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressColor = color || getColorFromConfidence(value);

  useEffect(() => {
    if (!animated || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            // Animate the value
            const duration = 1000;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplayValue(value * eased);

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, animated, hasAnimated]);

  // Update if value changes after animation
  useEffect(() => {
    if (hasAnimated || !animated) {
      setDisplayValue(value);
    }
  }, [value, hasAnimated, animated]);

  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  return (
    <div
      ref={ref}
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: ring, height: ring }}
    >
      {/* Background ring */}
      <svg
        className="absolute transform -rotate-90"
        width={ring}
        height={ring}
      >
        <defs>
          <linearGradient id={`gradient-${ring}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={progressColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={progressColor} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          stroke={`url(#gradient-${ring})`}
          strokeWidth={stroke}
          fill="none"
        />
      </svg>

      {/* Progress ring */}
      <svg
        className="absolute transform -rotate-90"
        width={ring}
        height={ring}
      >
        <defs>
          <linearGradient id={`progress-gradient-${ring}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={progressColor} />
            <stop offset="100%" stopColor={progressColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          stroke={`url(#progress-gradient-${ring})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center">
        <span
          className={cn('font-bold tabular-nums', fontSize)}
          style={{ color: progressColor }}
        >
          {Math.round(displayValue)}%
        </span>
        {label && (
          <span className={cn('font-medium text-foreground truncate max-w-[80%] text-center', sublabelSize)}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className={cn('text-muted-foreground', sublabelSize)}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

// Mini version for inline use
interface MiniConfidenceRingProps {
  value: number;
  size?: number;
  className?: string;
}

export function MiniConfidenceRing({
  value,
  size = 32,
  className,
}: MiniConfidenceRingProps) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getColorFromConfidence(value);
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span
        className="absolute text-xs font-bold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
