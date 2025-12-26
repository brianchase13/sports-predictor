'use client';

import Image from 'next/image';
import { Sport, SPORTS } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ESPN CDN league logo URLs
export const LEAGUE_LOGOS: Record<Sport, string> = {
  nfl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
  nba: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
  mlb: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png',
  nhl: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
  soccer: 'https://a.espncdn.com/i/teamlogos/soccer/500/default-team-logo-500.png',
};

const SIZES = {
  sm: { container: 24, text: 'text-xs' },
  md: { container: 40, text: 'text-sm' },
  lg: { container: 64, text: 'text-xl' },
  xl: { container: 96, text: 'text-3xl' },
} as const;

type LogoSize = keyof typeof SIZES;

interface LeagueLogoProps {
  sport: Sport;
  size?: LogoSize;
  showLabel?: boolean;
  className?: string;
}

export function LeagueLogo({
  sport,
  size = 'md',
  showLabel = false,
  className,
}: LeagueLogoProps) {
  const [imageError, setImageError] = useState(false);
  const sportInfo = SPORTS[sport];
  const logoUrl = LEAGUE_LOGOS[sport];
  const sizeConfig = SIZES[size];

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className="relative flex items-center justify-center rounded-lg overflow-hidden"
        style={{
          width: sizeConfig.container,
          height: sizeConfig.container,
        }}
      >
        {!imageError ? (
          <Image
            src={logoUrl}
            alt={`${sportInfo.name} logo`}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div
            className={cn(
              'w-full h-full flex items-center justify-center font-bold rounded-lg',
              sizeConfig.text
            )}
            style={{
              backgroundColor: sportInfo.color,
              color: 'white',
            }}
          >
            {sportInfo.name}
          </div>
        )}
      </div>
      {showLabel && (
        <span className={cn('font-semibold text-center', sizeConfig.text)}>
          {sportInfo.name}
        </span>
      )}
    </div>
  );
}

interface LeagueCardProps {
  sport: Sport;
  gameCount?: number;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LeagueCard({
  sport,
  gameCount,
  isActive = false,
  onClick,
  className,
}: LeagueCardProps) {
  const [imageError, setImageError] = useState(false);
  const sportInfo = SPORTS[sport];
  const logoUrl = LEAGUE_LOGOS[sport];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
        'hover:shadow-md hover:-translate-y-0.5',
        'flex-shrink-0 snap-start min-w-[120px] sm:min-w-0',
        isActive
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/50',
        className
      )}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        {!imageError ? (
          <Image
            src={logoUrl}
            alt={`${sportInfo.name} logo`}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-xl rounded-lg"
            style={{
              backgroundColor: sportInfo.color,
              color: 'white',
            }}
          >
            {sportInfo.name}
          </div>
        )}
      </div>
      <span className="font-semibold text-sm">{sportInfo.name}</span>
      {gameCount !== undefined && (
        <span className="text-xs text-muted-foreground">
          {gameCount} {gameCount === 1 ? 'game' : 'games'}
        </span>
      )}
    </button>
  );
}
