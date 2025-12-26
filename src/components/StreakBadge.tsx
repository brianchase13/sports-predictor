'use client';

import { cn } from '@/lib/utils';
import { Flame, Snowflake, Minus } from 'lucide-react';

interface StreakBadgeProps {
  type: 'win' | 'loss' | 'neutral';
  count: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizes = {
  sm: {
    badge: 'px-1.5 py-0.5 gap-1',
    icon: 'h-3 w-3',
    text: 'text-xs',
  },
  md: {
    badge: 'px-2 py-1 gap-1.5',
    icon: 'h-4 w-4',
    text: 'text-sm',
  },
  lg: {
    badge: 'px-3 py-1.5 gap-2',
    icon: 'h-5 w-5',
    text: 'text-base',
  },
};

export function StreakBadge({
  type,
  count,
  size = 'md',
  className,
  showLabel = false,
}: StreakBadgeProps) {
  if (count === 0) return null;

  const { badge, icon, text } = sizes[size];

  const config = {
    win: {
      bg: 'bg-gradient-to-r from-orange-500/20 to-red-500/20',
      border: 'border-orange-500/30',
      textColor: 'text-orange-600 dark:text-orange-400',
      Icon: Flame,
      iconClass: 'flame-icon text-orange-500',
      label: 'Win Streak',
      prefix: 'W',
    },
    loss: {
      bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      Icon: Snowflake,
      iconClass: 'ice-icon text-blue-500',
      label: 'Loss Streak',
      prefix: 'L',
    },
    neutral: {
      bg: 'bg-muted',
      border: 'border-muted-foreground/20',
      textColor: 'text-muted-foreground',
      Icon: Minus,
      iconClass: 'text-muted-foreground',
      label: 'No Streak',
      prefix: '',
    },
  };

  const { bg, border, textColor, Icon, iconClass, label, prefix } = config[type];

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border',
        bg,
        border,
        badge,
        className
      )}
      title={`${label}: ${count}`}
    >
      <Icon className={cn(icon, iconClass)} />
      <span className={cn('font-bold tabular-nums', text, textColor)}>
        {prefix}{count}
      </span>
      {showLabel && (
        <span className={cn('text-muted-foreground', text)}>
          {type === 'win' ? 'wins' : type === 'loss' ? 'losses' : ''}
        </span>
      )}
    </div>
  );
}

// Utility to calculate streak from results
export function calculateStreak(results: boolean[]): { type: 'win' | 'loss' | 'neutral'; count: number } {
  if (results.length === 0) {
    return { type: 'neutral', count: 0 };
  }

  const lastResult = results[0]; // Most recent first
  let count = 0;

  for (const result of results) {
    if (result === lastResult) {
      count++;
    } else {
      break;
    }
  }

  return {
    type: lastResult ? 'win' : 'loss',
    count,
  };
}
