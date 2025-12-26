import { Sport } from '../types';
import { FactorResult, RecentGame } from './types';

/**
 * Calculate recent form/momentum factor
 * Based on last N games performance
 */
export function calculateMomentumFactor(
  homeGames: RecentGame[],
  awayGames: RecentGame[],
  sport: Sport,
  gamesWindow: number = 5
): FactorResult {
  const homeForm = calculateFormScore(homeGames, gamesWindow);
  const awayForm = calculateFormScore(awayGames, gamesWindow);

  // Form differential (positive = home team in better form)
  const formDiff = homeForm.score - awayForm.score;

  // Normalize to -1 to +1 scale
  const normalizedScore = Math.max(-1, Math.min(1, formDiff));

  // Confidence based on data availability
  const gamesAnalyzed = Math.min(homeForm.gamesUsed, awayForm.gamesUsed);
  const confidence = Math.min(1, gamesAnalyzed / gamesWindow);

  // Generate description
  let description: string;
  if (Math.abs(formDiff) < 0.1) {
    description = `Both teams similar form (${(homeForm.winPct * 100).toFixed(0)}% vs ${(awayForm.winPct * 100).toFixed(0)}% last ${gamesWindow})`;
  } else if (formDiff > 0) {
    description = `Home team in better form: ${(homeForm.winPct * 100).toFixed(0)}% vs ${(awayForm.winPct * 100).toFixed(0)}% last ${gamesWindow} games`;
  } else {
    description = `Away team in better form: ${(awayForm.winPct * 100).toFixed(0)}% vs ${(homeForm.winPct * 100).toFixed(0)}% last ${gamesWindow} games`;
  }

  return {
    name: 'Recent Form',
    value: formDiff,
    normalizedScore,
    weight: getMomentumWeight(sport),
    description,
    confidence,
  };
}

interface FormScore {
  score: number; // -1 to +1
  winPct: number;
  avgMargin: number;
  gamesUsed: number;
}

/**
 * Calculate form score from recent games
 */
function calculateFormScore(games: RecentGame[], window: number): FormScore {
  if (games.length === 0) {
    return { score: 0, winPct: 0.5, avgMargin: 0, gamesUsed: 0 };
  }

  // Sort by date descending and take last N games
  const recentGames = [...games]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, window);

  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalMargin = 0;

  for (const game of recentGames) {
    if (game.result === 'win') wins++;
    else if (game.result === 'loss') losses++;
    else draws++;

    totalMargin += game.teamScore - game.opponentScore;
  }

  const gamesUsed = recentGames.length;
  const winPct = gamesUsed > 0 ? (wins + draws * 0.5) / gamesUsed : 0.5;
  const avgMargin = gamesUsed > 0 ? totalMargin / gamesUsed : 0;

  // Score combines win percentage and margin of victory
  // Win pct is primary (70%), margin is secondary (30%)
  const winPctScore = (winPct - 0.5) * 2; // -1 to +1
  const marginScore = Math.max(-1, Math.min(1, avgMargin / 15)); // Normalize margin

  const score = winPctScore * 0.7 + marginScore * 0.3;

  return { score, winPct, avgMargin, gamesUsed };
}

/**
 * Get sport-specific weight for momentum factor
 */
function getMomentumWeight(sport: Sport): number {
  const weights: Record<Sport, number> = {
    nfl: 0.15,
    nba: 0.15,
    mlb: 0.10, // Larger sample size in MLB, so form less volatile
    nhl: 0.12,
    soccer: 0.15,
  };
  return weights[sport];
}

/**
 * Calculate scoring trend factor
 * Are teams scoring more or less than their season average recently?
 */
export function calculateScoringTrendFactor(
  homeGames: RecentGame[],
  awayGames: RecentGame[],
  homeSeasonAvg: number,
  awaySeasonAvg: number,
  sport: Sport
): FactorResult {
  const homeRecent = getRecentAvgScore(homeGames, 5);
  const awayRecent = getRecentAvgScore(awayGames, 5);

  // Calculate trend vs season average
  const homeTrend = homeSeasonAvg > 0 ? (homeRecent - homeSeasonAvg) / homeSeasonAvg : 0;
  const awayTrend = awaySeasonAvg > 0 ? (awayRecent - awaySeasonAvg) / awaySeasonAvg : 0;

  // Trend differential
  const trendDiff = homeTrend - awayTrend;
  const normalizedScore = Math.max(-1, Math.min(1, trendDiff * 5));

  const confidence = homeGames.length >= 3 && awayGames.length >= 3 ? 0.8 : 0.4;

  let description: string;
  if (Math.abs(trendDiff) < 0.05) {
    description = 'Both teams scoring near their season averages';
  } else if (trendDiff > 0) {
    description = `Home team scoring ${(homeTrend * 100).toFixed(0)}% above average recently`;
  } else {
    description = `Away team scoring ${(awayTrend * 100).toFixed(0)}% above average recently`;
  }

  return {
    name: 'Scoring Trend',
    value: trendDiff,
    normalizedScore,
    weight: 0.05,
    description,
    confidence,
  };
}

/**
 * Calculate defensive trend factor
 */
export function calculateDefensiveTrendFactor(
  homeGames: RecentGame[],
  awayGames: RecentGame[],
  homeSeasonAvgAllowed: number,
  awaySeasonAvgAllowed: number,
  sport: Sport
): FactorResult {
  const homeRecentAllowed = getRecentAvgOpponentScore(homeGames, 5);
  const awayRecentAllowed = getRecentAvgOpponentScore(awayGames, 5);

  // Lower allowed = better defense, so invert the trend
  const homeTrend = homeSeasonAvgAllowed > 0
    ? (homeSeasonAvgAllowed - homeRecentAllowed) / homeSeasonAvgAllowed
    : 0;
  const awayTrend = awaySeasonAvgAllowed > 0
    ? (awaySeasonAvgAllowed - awayRecentAllowed) / awaySeasonAvgAllowed
    : 0;

  const trendDiff = homeTrend - awayTrend;
  const normalizedScore = Math.max(-1, Math.min(1, trendDiff * 5));

  const confidence = homeGames.length >= 3 && awayGames.length >= 3 ? 0.8 : 0.4;

  let description: string;
  if (Math.abs(trendDiff) < 0.05) {
    description = 'Both defenses performing near season average';
  } else if (trendDiff > 0) {
    description = `Home defense improving, allowing ${(homeTrend * 100).toFixed(0)}% less than average`;
  } else {
    description = `Away defense improving, allowing ${(awayTrend * 100).toFixed(0)}% less than average`;
  }

  return {
    name: 'Defensive Trend',
    value: trendDiff,
    normalizedScore,
    weight: 0.05,
    description,
    confidence,
  };
}

function getRecentAvgScore(games: RecentGame[], window: number): number {
  const recent = games.slice(0, window);
  if (recent.length === 0) return 0;
  const total = recent.reduce((sum, g) => sum + g.teamScore, 0);
  return total / recent.length;
}

function getRecentAvgOpponentScore(games: RecentGame[], window: number): number {
  const recent = games.slice(0, window);
  if (recent.length === 0) return 0;
  const total = recent.reduce((sum, g) => sum + g.opponentScore, 0);
  return total / recent.length;
}

/**
 * Get momentum adjustment for probability
 */
export function getMomentumAdjustment(
  homeGames: RecentGame[],
  awayGames: RecentGame[],
  sport: Sport
): number {
  const factor = calculateMomentumFactor(homeGames, awayGames, sport);
  return factor.normalizedScore * factor.weight;
}
