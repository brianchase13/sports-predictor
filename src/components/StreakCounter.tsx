'use client';

import { cn } from '@/lib/utils';
import { useStreak } from '@/hooks/use-streak';
import { Flame, Zap, Trophy, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StreakCounterProps {
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const sizes = {
  sm: {
    container: 'px-2 py-1 gap-1.5',
    icon: 'h-4 w-4',
    text: 'text-sm',
    dot: 'h-2 w-2',
  },
  md: {
    container: 'px-3 py-1.5 gap-2',
    icon: 'h-5 w-5',
    text: 'text-base',
    dot: 'h-2.5 w-2.5',
  },
  lg: {
    container: 'px-4 py-2 gap-2.5',
    icon: 'h-6 w-6',
    text: 'text-lg',
    dot: 'h-3 w-3',
  },
};

export function StreakCounter({
  size = 'md',
  showDetails = false,
  className,
}: StreakCounterProps) {
  const {
    isLoaded,
    currentStreak,
    longestStreak,
    hasPickedToday,
    streakStatus,
    weekActivity,
  } = useStreak();

  if (!isLoaded) {
    return (
      <div
        className={cn(
          'animate-pulse bg-muted rounded-full',
          sizes[size].container,
          className
        )}
      />
    );
  }

  const s = sizes[size];

  // Determine icon and colors based on streak
  const getStreakTheme = () => {
    if (currentStreak === 0) {
      return {
        Icon: Zap,
        bgClass: 'bg-muted',
        textClass: 'text-muted-foreground',
        iconClass: 'text-muted-foreground',
        label: 'Start your streak!',
      };
    }

    if (currentStreak >= 7) {
      return {
        Icon: Trophy,
        bgClass: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
        textClass: 'text-amber-600 dark:text-amber-400',
        iconClass: 'text-amber-500 animate-pulse',
        label: 'On fire!',
      };
    }

    return {
      Icon: Flame,
      bgClass: 'bg-gradient-to-r from-orange-500/20 to-red-500/20',
      textClass: 'text-orange-600 dark:text-orange-400',
      iconClass: 'flame-icon text-orange-500',
      label: 'Keep it going!',
    };
  };

  const theme = getStreakTheme();
  const { Icon, bgClass, textClass, iconClass, label } = theme;

  const content = (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-transparent',
        bgClass,
        s.container,
        streakStatus === 'at-risk' && 'border-amber-500/50 animate-pulse',
        className
      )}
    >
      <Icon className={cn(s.icon, iconClass)} />
      <span className={cn('font-bold tabular-nums', s.text, textClass)}>
        {currentStreak}
      </span>
      {streakStatus === 'at-risk' && !hasPickedToday && (
        <AlertTriangle className={cn(s.icon, 'text-amber-500 ml-1')} />
      )}
    </div>
  );

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2 p-1">
              <p className="font-semibold">{label}</p>
              <div className="flex gap-1">
                {weekActivity.map((active, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-sm',
                      s.dot,
                      active
                        ? 'bg-orange-500'
                        : 'bg-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              {streakStatus === 'at-risk' && (
                <p className="text-xs text-amber-500">Pick today to keep your streak!</p>
              )}
              {longestStreak > currentStreak && (
                <p className="text-xs text-muted-foreground">
                  Best: {longestStreak} days
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {content}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {weekActivity.map((active, i) => (
            <div
              key={i}
              className={cn(
                'rounded-sm',
                s.dot,
                active ? 'bg-orange-500' : 'bg-muted-foreground/30'
              )}
              title={active ? 'Picked' : 'Missed'}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {hasPickedToday
            ? "You've picked today!"
            : streakStatus === 'at-risk'
              ? 'Pick today to keep your streak!'
              : 'Make a pick to start your streak'}
        </p>
        {longestStreak > 0 && (
          <p className="text-xs text-muted-foreground">
            Longest streak: {longestStreak} days
          </p>
        )}
      </div>
    </div>
  );
}

// Minimal streak indicator for nav/header
export function StreakBadge({ className }: { className?: string }) {
  const { currentStreak, isLoaded, streakStatus } = useStreak();

  if (!isLoaded || currentStreak === 0) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold',
        'bg-gradient-to-r from-orange-500/20 to-red-500/20',
        'text-orange-600 dark:text-orange-400',
        streakStatus === 'at-risk' && 'animate-pulse',
        className
      )}
    >
      <Flame className="h-3 w-3 flame-icon" />
      <span className="tabular-nums">{currentStreak}</span>
    </div>
  );
}
