import { Sport } from '../types';
import { FactorResult } from './types';

// Season configuration by sport
const SEASON_CONFIG: Record<Sport, {
  regularSeasonGames: number;
  earlySeasonGames: number; // First N games considered "early"
  lateSeasonStart: number; // Game number where "late season" starts
  playoffUrgency: boolean; // Does late season have playoff implications?
}> = {
  nfl: {
    regularSeasonGames: 17,
    earlySeasonGames: 4,
    lateSeasonStart: 13,
    playoffUrgency: true,
  },
  nba: {
    regularSeasonGames: 82,
    earlySeasonGames: 15,
    lateSeasonStart: 65,
    playoffUrgency: true,
  },
  mlb: {
    regularSeasonGames: 162,
    earlySeasonGames: 30,
    lateSeasonStart: 130,
    playoffUrgency: true,
  },
  nhl: {
    regularSeasonGames: 82,
    earlySeasonGames: 15,
    lateSeasonStart: 65,
    playoffUrgency: true,
  },
  soccer: {
    regularSeasonGames: 38,
    earlySeasonGames: 8,
    lateSeasonStart: 30,
    playoffUrgency: true, // Relegation/title race
  },
};

/**
 * Calculate season phase factor
 * Early season = less reliable predictions
 * Late season = more motivation for playoff teams
 */
export function calculateSeasonPhaseFactor(
  homeGamesPlayed: number,
  awayGamesPlayed: number,
  homeRecord: { wins: number; losses: number; draws?: number },
  awayRecord: { wins: number; losses: number; draws?: number },
  sport: Sport
): FactorResult {
  const config = SEASON_CONFIG[sport];

  // Calculate season phase for each team
  const homePhase = getSeasonPhase(homeGamesPlayed, config);
  const awayPhase = getSeasonPhase(awayGamesPlayed, config);

  // Calculate motivation based on playoff position
  const homeMotivation = calculateMotivation(
    homeRecord,
    homeGamesPlayed,
    config
  );
  const awayMotivation = calculateMotivation(
    awayRecord,
    awayGamesPlayed,
    config
  );

  // Motivation differential
  const motivationDiff = homeMotivation - awayMotivation;
  const normalizedScore = Math.max(-1, Math.min(1, motivationDiff));

  // Confidence is lower early in season
  const avgGamesPlayed = (homeGamesPlayed + awayGamesPlayed) / 2;
  const confidence = Math.min(
    1,
    avgGamesPlayed / config.earlySeasonGames
  );

  // Generate description
  let description: string;
  const phaseDesc = getPhaseDescription(homePhase, awayPhase);

  if (Math.abs(motivationDiff) < 0.1) {
    description = `${phaseDesc}. Similar playoff positioning`;
  } else if (motivationDiff > 0) {
    description = `${phaseDesc}. Home team more motivated (playoff race)`;
  } else {
    description = `${phaseDesc}. Away team more motivated (playoff race)`;
  }

  return {
    name: 'Season Phase',
    value: motivationDiff,
    normalizedScore,
    weight: getSeasonPhaseWeight(sport),
    description,
    confidence,
  };
}

type SeasonPhase = 'early' | 'mid' | 'late';

function getSeasonPhase(
  gamesPlayed: number,
  config: typeof SEASON_CONFIG.nfl
): SeasonPhase {
  if (gamesPlayed <= config.earlySeasonGames) return 'early';
  if (gamesPlayed >= config.lateSeasonStart) return 'late';
  return 'mid';
}

function getPhaseDescription(
  homePhase: SeasonPhase,
  awayPhase: SeasonPhase
): string {
  if (homePhase === awayPhase) {
    return `Both teams in ${homePhase} season`;
  }
  return `Home in ${homePhase} season, away in ${awayPhase}`;
}

/**
 * Calculate motivation score based on playoff position
 * Returns 0-1, higher = more motivated
 */
function calculateMotivation(
  record: { wins: number; losses: number; draws?: number },
  gamesPlayed: number,
  config: typeof SEASON_CONFIG.nfl
): number {
  if (gamesPlayed < config.earlySeasonGames) {
    return 0.5; // Too early to assess
  }

  const winPct =
    (record.wins + (record.draws || 0) * 0.5) /
    (record.wins + record.losses + (record.draws || 0));

  // Teams fighting for playoffs (around .500) are most motivated late
  // Very good teams and very bad teams have less urgency
  const phase = getSeasonPhase(gamesPlayed, config);

  if (phase === 'late') {
    // Playoff bubble teams (40-60% win rate) most motivated
    if (winPct >= 0.4 && winPct <= 0.6) {
      return 0.9;
    }
    // Contenders still motivated
    if (winPct > 0.6) {
      return 0.7;
    }
    // Eliminated teams less motivated
    return 0.3;
  }

  return 0.5; // Base motivation during regular season
}

function getSeasonPhaseWeight(sport: Sport): number {
  const weights: Record<Sport, number> = {
    nfl: 0.05,
    nba: 0.05,
    mlb: 0.10, // Long season, phase matters more
    nhl: 0.08,
    soccer: 0.06,
  };
  return weights[sport];
}

/**
 * Get early season confidence penalty
 * Predictions are less reliable early in the season
 */
export function getEarlySeasonPenalty(
  gamesPlayed: number,
  sport: Sport
): number {
  const config = SEASON_CONFIG[sport];

  if (gamesPlayed >= config.earlySeasonGames) {
    return 0; // No penalty after early season
  }

  // Linear penalty from 15% (game 1) to 0% (after early season)
  const ratio = gamesPlayed / config.earlySeasonGames;
  return 0.15 * (1 - ratio);
}
