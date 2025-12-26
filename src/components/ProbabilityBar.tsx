'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProbabilityBarProps {
  homeTeam: string;
  awayTeam: string;
  homeWinProbability: number; // 0-100
  homeColor?: string;
  awayColor?: string;
  className?: string;
  animated?: boolean;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProbabilityBar({
  homeTeam,
  awayTeam,
  homeWinProbability,
  homeColor = '#3b82f6', // blue-500
  awayColor = '#ef4444', // red-500
  className,
  animated = true,
  showLabels = true,
  size = 'md',
}: ProbabilityBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(animated ? 50 : homeWinProbability);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const awayWinProbability = 100 - homeWinProbability;

  useEffect(() => {
    if (!animated || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            // Small delay for visual effect
            setTimeout(() => {
              setAnimatedWidth(homeWinProbability);
            }, 200);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [homeWinProbability, animated]);

  // Update if value changes after mount
  useEffect(() => {
    if (hasAnimated.current || !animated) {
      setAnimatedWidth(homeWinProbability);
    }
  }, [homeWinProbability, animated]);

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {showLabels && (
        <div className={cn('flex justify-between mb-1', fontSizes[size])}>
          <div className="flex items-center gap-1.5">
            <span className="font-medium truncate max-w-[100px]">{homeTeam}</span>
            <span
              className="font-bold tabular-nums"
              style={{ color: homeColor }}
            >
              {Math.round(homeWinProbability)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="font-bold tabular-nums"
              style={{ color: awayColor }}
            >
              {Math.round(awayWinProbability)}%
            </span>
            <span className="font-medium truncate max-w-[100px]">{awayTeam}</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative w-full rounded-full overflow-hidden',
          heights[size]
        )}
        style={{ backgroundColor: awayColor }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${animatedWidth}%`,
            backgroundColor: homeColor,
          }}
        />

        {/* Center divider */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-background/50 -translate-x-1/2" />
      </div>
    </div>
  );
}

// Compact version for card usage
interface CompactProbabilityBarProps {
  winProbability: number;
  teamColor?: string;
  className?: string;
}

export function CompactProbabilityBar({
  winProbability,
  teamColor = '#3b82f6',
  className,
}: CompactProbabilityBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWidth(winProbability);
    }, 100);
    return () => clearTimeout(timeout);
  }, [winProbability]);

  return (
    <div className={cn('w-full', className)}>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${width}%`,
            backgroundColor: teamColor,
          }}
        />
      </div>
    </div>
  );
}
