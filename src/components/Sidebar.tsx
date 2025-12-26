'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sport, SPORTS } from '@/lib/types';
import { LeagueLogo } from './LeagueLogo';
import { BarChart3, History, Trophy } from 'lucide-react';

interface SidebarProps {
  onSportSelect?: (sport: Sport | null) => void;
  selectedSport?: Sport | null;
  className?: string;
}

const NAV_ITEMS = [
  { href: '/', label: 'Predictions', icon: BarChart3 },
  { href: '/history', label: 'History', icon: History },
];

const SPORT_LIST: Sport[] = ['nfl', 'nba', 'mlb', 'nhl', 'soccer'];

export function Sidebar({
  onSportSelect,
  selectedSport,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col w-[220px] h-full bg-sidebar border-r border-sidebar-border',
        className
      )}
    >
      {/* App Branding */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <Trophy className="h-6 w-6 text-primary" />
        <div className="flex flex-col">
          <span className="font-bold text-base leading-tight">Sports</span>
          <span className="text-sm text-muted-foreground leading-tight">Predictor</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-sidebar-border" />

      {/* Leagues Section */}
      <div className="flex flex-col gap-2 px-3 py-4 flex-1">
        <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Leagues
        </span>
        <div className="flex flex-col gap-0.5">
          {/* All Sports Option */}
          <button
            onClick={() => onSportSelect?.(null)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
              selectedSport === null
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs">
              All
            </div>
            <span>All Sports</span>
          </button>

          {/* Individual Sports */}
          {SPORT_LIST.map((sport) => {
            const isActive = selectedSport === sport;
            return (
              <button
                key={sport}
                onClick={() => onSportSelect?.(sport)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <LeagueLogo sport={sport} size="sm" />
                <span>{SPORTS[sport].name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
