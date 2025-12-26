'use client';

import { Team } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TeamLogoProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

const fontSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function TeamLogo({ team, size = 'md', showName = false, className }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const hasLogo = team.logoUrl && !imageError;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      {hasLogo ? (
        <div className={cn(sizeClasses[size], 'relative')}>
          <img
            src={team.logoUrl}
            alt={`${team.name} logo`}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div
          className={cn(
            sizeClasses[size],
            'rounded-full flex items-center justify-center font-bold text-white shadow-sm',
            fontSizeClasses[size]
          )}
          style={{ backgroundColor: getTeamColor(team) }}
        >
          {team.abbreviation.slice(0, 3)}
        </div>
      )}
      {showName && (
        <span className={cn('font-medium text-center leading-tight', fontSizeClasses[size])}>
          {team.name}
        </span>
      )}
    </div>
  );
}

// Generate a consistent color based on team abbreviation
function getTeamColor(team: Team): string {
  // Sport-based default colors
  const sportColors: Record<string, string> = {
    nfl: '#013369',
    nba: '#C9082A',
    mlb: '#002D72',
    nhl: '#000000',
    soccer: '#326295',
  };

  // Use sport color as fallback
  return sportColors[team.sport] || '#6B7280';
}

// Matchup component showing two teams vs each other
interface MatchupDisplayProps {
  homeTeam: Team;
  awayTeam: Team;
  size?: 'sm' | 'md' | 'lg';
  showRecords?: boolean;
  highlightWinner?: 'home' | 'away' | null;
}

export function MatchupDisplay({
  homeTeam,
  awayTeam,
  size = 'md',
  showRecords = true,
  highlightWinner = null,
}: MatchupDisplayProps) {
  const formatRecord = (team: Team) => {
    if (!team.record) return null;
    const { wins, losses, draws } = team.record;
    return draws !== undefined ? `${wins}-${losses}-${draws}` : `${wins}-${losses}`;
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Away Team */}
      <div
        className={cn(
          'flex flex-col items-center transition-opacity',
          highlightWinner === 'home' && 'opacity-50'
        )}
      >
        <TeamLogo team={awayTeam} size={size} />
        <span className={cn(
          'font-medium mt-1',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
          highlightWinner === 'away' && 'font-bold'
        )}>
          {awayTeam.name}
        </span>
        {showRecords && formatRecord(awayTeam) && (
          <span className="text-xs text-muted-foreground">
            ({formatRecord(awayTeam)})
          </span>
        )}
      </div>

      {/* VS Divider */}
      <div className="flex flex-col items-center">
        <span className={cn(
          'font-bold text-muted-foreground',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          @
        </span>
      </div>

      {/* Home Team */}
      <div
        className={cn(
          'flex flex-col items-center transition-opacity',
          highlightWinner === 'away' && 'opacity-50'
        )}
      >
        <TeamLogo team={homeTeam} size={size} />
        <span className={cn(
          'font-medium mt-1',
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
          highlightWinner === 'home' && 'font-bold'
        )}>
          {homeTeam.name}
        </span>
        {showRecords && formatRecord(homeTeam) && (
          <span className="text-xs text-muted-foreground">
            ({formatRecord(homeTeam)})
          </span>
        )}
      </div>
    </div>
  );
}
