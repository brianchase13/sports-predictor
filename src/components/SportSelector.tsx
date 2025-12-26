'use client';

import { Sport, SPORTS, SportInfo } from '@/lib/types';
import { LeagueCard } from './LeagueLogo';
import { cn } from '@/lib/utils';

interface SportSelectorProps {
  selectedSport: Sport | 'all';
  onSelect: (sport: Sport | 'all') => void;
  gameCounts?: Record<Sport, number>;
  className?: string;
}

const SPORT_ORDER: Sport[] = ['nfl', 'nba', 'mlb', 'nhl', 'soccer'];

export function SportSelector({
  selectedSport,
  onSelect,
  gameCounts,
  className,
}: SportSelectorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
        {/* All Sports Card */}
        <button
          onClick={() => onSelect('all')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
            'hover:shadow-md hover:-translate-y-0.5',
            'flex-shrink-0 snap-start min-w-[120px] sm:min-w-0',
            selectedSport === 'all'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-border bg-card hover:border-primary/50'
          )}
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
          </div>
          <span className="font-semibold text-sm">All Sports</span>
          {gameCounts && (
            <span className="text-xs text-muted-foreground">
              {Object.values(gameCounts).reduce((a, b) => a + b, 0)} games
            </span>
          )}
        </button>

        {/* Individual Sport Cards */}
        {SPORT_ORDER.map((sport) => (
          <LeagueCard
            key={sport}
            sport={sport}
            isActive={selectedSport === sport}
            onClick={() => onSelect(sport)}
            gameCount={gameCounts?.[sport]}
          />
        ))}
      </div>
    </div>
  );
}

interface CompactSportSelectorProps {
  selectedSport: Sport | 'all';
  onSelect: (sport: Sport | 'all') => void;
  className?: string;
}

export function CompactSportSelector({
  selectedSport,
  onSelect,
  className,
}: CompactSportSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onSelect('all')}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          selectedSport === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80'
        )}
      >
        All
      </button>
      {SPORT_ORDER.map((sport) => {
        const sportInfo = SPORTS[sport];
        return (
          <button
            key={sport}
            onClick={() => onSelect(sport)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
              selectedSport === sport
                ? 'text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
            style={
              selectedSport === sport
                ? { backgroundColor: sportInfo.color }
                : undefined
            }
          >
            {sportInfo.icon} {sportInfo.name}
          </button>
        );
      })}
    </div>
  );
}
