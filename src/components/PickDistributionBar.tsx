'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePicks, PickChoice } from '@/hooks/use-picks';
import { Users, Check } from 'lucide-react';

interface PickDistributionBarProps {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeColor?: string;
  awayColor?: string;
  showDraw?: boolean;
  className?: string;
  onPick?: (choice: PickChoice) => void;
  interactive?: boolean;
}

export function PickDistributionBar({
  gameId,
  homeTeam,
  awayTeam,
  homeColor = '#3b82f6',
  awayColor = '#ef4444',
  showDraw = false,
  className,
  onPick,
  interactive = true,
}: PickDistributionBarProps) {
  const { getDistribution, getTotalPicks, getUserPick, makePick, isLoaded } = usePicks();
  const [isAnimated, setIsAnimated] = useState(false);

  const distribution = getDistribution(gameId);
  const totalPicks = getTotalPicks(gameId);
  const userPick = getUserPick(gameId);

  // Animate on mount
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => setIsAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  const handlePick = (choice: PickChoice) => {
    if (!interactive) return;
    makePick(gameId, choice);
    onPick?.(choice);
  };

  const PickButton = ({
    choice,
    team,
    percent,
    color
  }: {
    choice: PickChoice;
    team: string;
    percent: number;
    color: string;
  }) => {
    const isSelected = userPick === choice;

    return (
      <button
        onClick={() => handlePick(choice)}
        disabled={!interactive}
        className={cn(
          'relative flex-1 py-2 px-3 rounded-lg transition-all duration-300',
          'border-2 hover:scale-[1.02] active:scale-[0.98]',
          interactive && 'cursor-pointer',
          !interactive && 'cursor-default',
          isSelected
            ? 'border-current shadow-lg'
            : 'border-transparent bg-muted/50 hover:bg-muted'
        )}
        style={{
          borderColor: isSelected ? color : undefined,
          backgroundColor: isSelected ? `${color}15` : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm">{team}</span>
            {isSelected && (
              <Check
                className="h-3.5 w-3.5 animate-scale-in"
                style={{ color }}
              />
            )}
          </div>
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: isSelected ? color : undefined }}
          >
            {isAnimated ? percent : 0}%
          </div>
        </div>

        {/* Animated fill bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 rounded-b-md transition-all duration-700 ease-out"
          style={{
            backgroundColor: color,
            width: isAnimated ? `${percent}%` : '0%',
            opacity: 0.6,
          }}
        />
      </button>
    );
  };

  if (!isLoaded) {
    return (
      <div className={cn('animate-pulse bg-muted rounded-lg h-20', className)} />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">Community Picks</span>
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          <span className="tabular-nums">{totalPicks.toLocaleString()} picks</span>
        </div>
      </div>

      {/* Pick Buttons */}
      <div className="flex gap-2">
        <PickButton
          choice="away"
          team={awayTeam}
          percent={distribution.away}
          color={awayColor}
        />

        {showDraw && (
          <PickButton
            choice="draw"
            team="Draw"
            percent={distribution.draw}
            color="#6b7280"
          />
        )}

        <PickButton
          choice="home"
          team={homeTeam}
          percent={distribution.home}
          color={homeColor}
        />
      </div>

      {/* User pick confirmation */}
      {userPick && (
        <p className="text-xs text-center text-muted-foreground animate-fade-in">
          You picked <span className="font-semibold">{
            userPick === 'home' ? homeTeam :
            userPick === 'away' ? awayTeam :
            'Draw'
          }</span>
        </p>
      )}
    </div>
  );
}
