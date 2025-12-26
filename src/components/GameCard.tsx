'use client';

import { Game, SPORTS } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MapPin, Clock } from 'lucide-react';
import { TeamLogo } from './TeamLogo';

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const sportInfo = SPORTS[game.sport];

  const formatRecord = (team: typeof game.homeTeam) => {
    if (!team.record) return null;
    const { wins, losses, draws } = team.record;
    return draws !== undefined ? `${wins}-${losses}-${draws}` : `${wins}-${losses}`;
  };

  const getStatusBadge = () => {
    switch (game.status) {
      case 'live':
        return (
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        );
      case 'completed':
        return <Badge variant="secondary">Final</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="font-medium"
            style={{ backgroundColor: sportInfo.color, color: 'white' }}
          >
            {sportInfo.icon} {sportInfo.name}
          </Badge>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(game.startTime), 'MMM d, h:mm a')}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Matchup Display */}
        <div className="flex items-center justify-between">
          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1">
            <TeamLogo team={game.awayTeam} size="md" />
            <div>
              <p className="font-medium">{game.awayTeam.name}</p>
              {formatRecord(game.awayTeam) && (
                <p className="text-xs text-muted-foreground">
                  {formatRecord(game.awayTeam)}
                </p>
              )}
            </div>
          </div>

          {/* Score / VS */}
          <div className="px-4 text-center">
            {game.status === 'completed' || game.status === 'live' ? (
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${
                  game.awayScore! > game.homeScore! ? '' : 'text-muted-foreground'
                }`}>
                  {game.awayScore}
                </span>
                <span className="text-muted-foreground">-</span>
                <span className={`text-2xl font-bold ${
                  game.homeScore! > game.awayScore! ? '' : 'text-muted-foreground'
                }`}>
                  {game.homeScore}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-muted-foreground">@</span>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1 justify-end text-right">
            <div>
              <p className="font-medium">{game.homeTeam.name}</p>
              {formatRecord(game.homeTeam) && (
                <p className="text-xs text-muted-foreground">
                  {formatRecord(game.homeTeam)}
                </p>
              )}
            </div>
            <TeamLogo team={game.homeTeam} size="md" />
          </div>
        </div>

        {/* Venue */}
        {game.venue && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4 pt-3 border-t">
            <MapPin className="h-3 w-3" />
            <span>{game.venue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
