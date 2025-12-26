'use client';

import { cn } from '@/lib/utils';
import { usePickHistory } from '@/hooks/use-pick-history';
import { SPORTS, Sport } from '@/lib/types';
import { Target, TrendingUp, Award, ChevronRight } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AccuracyBadgeProps {
  sport?: Sport;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizes = {
  sm: {
    container: 'px-2 py-1 gap-1',
    icon: 'h-3.5 w-3.5',
    text: 'text-xs',
    accent: 'text-sm',
  },
  md: {
    container: 'px-2.5 py-1.5 gap-1.5',
    icon: 'h-4 w-4',
    text: 'text-sm',
    accent: 'text-base',
  },
  lg: {
    container: 'px-3 py-2 gap-2',
    icon: 'h-5 w-5',
    text: 'text-base',
    accent: 'text-lg',
  },
};

function getAccuracyTheme(accuracy: number) {
  if (accuracy >= 70) {
    return {
      bgClass: 'bg-emerald-500/10 border-emerald-500/30',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      label: 'Hot Streak',
    };
  }
  if (accuracy >= 50) {
    return {
      bgClass: 'bg-amber-500/10 border-amber-500/30',
      textClass: 'text-amber-600 dark:text-amber-400',
      label: 'On Track',
    };
  }
  return {
    bgClass: 'bg-rose-500/10 border-rose-500/30',
    textClass: 'text-rose-600 dark:text-rose-400',
    label: 'Room to Grow',
  };
}

export function AccuracyBadge({
  sport,
  size = 'md',
  showLabel = false,
  className,
}: AccuracyBadgeProps) {
  const { isLoaded, getAccuracy, stats } = usePickHistory();

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

  const accuracy = getAccuracy(sport);
  const totalPicks = sport
    ? stats.bySport[sport].total
    : stats.total;

  if (totalPicks === 0) {
    return null; // Don't show badge with no picks
  }

  const s = sizes[size];
  const theme = getAccuracyTheme(accuracy);
  const sportInfo = sport ? SPORTS[sport] : null;

  const badge = (
    <div
      className={cn(
        'inline-flex items-center rounded-full border',
        theme.bgClass,
        s.container,
        className
      )}
    >
      {sportInfo ? (
        <span className={s.icon}>{sportInfo.icon}</span>
      ) : (
        <Target className={cn(s.icon, theme.textClass)} />
      )}
      <span className={cn('font-bold tabular-nums', s.accent, theme.textClass)}>
        {accuracy}%
      </span>
      {showLabel && (
        <span className={cn('text-muted-foreground ml-1', s.text)}>
          ({totalPicks} picks)
        </span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">
            {sport ? `${SPORTS[sport].name} Accuracy` : 'Overall Accuracy'}
          </p>
          <p className="text-sm text-muted-foreground">
            {accuracy}% from {totalPicks} picks
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Full accuracy dashboard card
interface AccuracyCardProps {
  className?: string;
  onViewDetails?: () => void;
}

export function AccuracyCard({ className, onViewDetails }: AccuracyCardProps) {
  const { isLoaded, stats, getAccuracy } = usePickHistory();

  if (!isLoaded) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="h-32" />
      </Card>
    );
  }

  const overallAccuracy = getAccuracy();
  const resolvedPicks = stats.total - stats.pending;

  // Get sport accuracies, sorted by picks
  const sportAccuracies = (Object.keys(SPORTS) as Sport[])
    .map((sport) => ({
      sport,
      accuracy: getAccuracy(sport),
      total: stats.bySport[sport].total,
    }))
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);

  if (stats.total === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="font-medium text-muted-foreground">No picks yet</p>
          <p className="text-sm text-muted-foreground">
            Make your first pick to start tracking accuracy!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-amber-500" />
          Your Accuracy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall accuracy */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  'text-3xl font-bold tabular-nums',
                  getAccuracyTheme(overallAccuracy).textClass
                )}
              >
                {overallAccuracy}%
              </span>
              <span className="text-sm text-muted-foreground">overall</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.correct}/{resolvedPicks} correct
              {stats.pending > 0 && ` • ${stats.pending} pending`}
            </p>
          </div>
          <TrendingUp
            className={cn(
              'h-8 w-8',
              overallAccuracy >= 50 ? 'text-emerald-500' : 'text-rose-500'
            )}
          />
        </div>

        {/* Sport breakdown */}
        {sportAccuracies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              By Sport
            </p>
            <div className="flex flex-wrap gap-2">
              {sportAccuracies.slice(0, 4).map(({ sport, accuracy, total }) => (
                <AccuracyBadge
                  key={sport}
                  sport={sport}
                  size="sm"
                  showLabel
                />
              ))}
            </div>
          </div>
        )}

        {/* View details */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center justify-center w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors group"
          >
            View Full History
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}
