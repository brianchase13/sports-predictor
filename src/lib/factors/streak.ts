import { Sport } from '../types';
import { FactorResult, RecentGame } from './types';

/**
 * Calculate win/loss streak factor
 * Positive streak = winning, negative = losing
 */
export function calculateStreakFactor(
  homeGames: RecentGame[],
  awayGames: RecentGame[],
  sport: Sport
): FactorResult {
  const homeStreak = getStreak(homeGames);
  const awayStreak = getStreak(awayGames);

  // Streak differential (positive = home team has better streak)
  const streakDiff = homeStreak - awayStreak;

  // Normalize to -1 to +1 scale
  // Max meaningful streak difference is about 10 games
  const normalizedScore = Math.max(-1, Math.min(1, streakDiff / 10));

  // Confidence based on how many games we have data for
  const gamesAnalyzed = Math.min(homeGames.length, awayGames.length);
  const confidence = Math.min(1, gamesAnalyzed / 5);

  // Generate description
  let description: string;
  if (Math.abs(streakDiff) < 2) {
    description = 'Both teams have similar recent momentum';
  } else if (streakDiff > 0) {
    description = homeStreak > 0
      ? `Home team on ${homeStreak}-game win streak`
      : `Away team on ${Math.abs(awayStreak)}-game losing streak`;
  } else {
    description = awayStreak > 0
      ? `Away team on ${awayStreak}-game win streak`
      : `Home team on ${Math.abs(homeStreak)}-game losing streak`;
  }

  return {
    name: 'Win/Loss Streak',
    value: streakDiff,
    normalizedScore,
    weight: getStreakWeight(sport),
    description,
    confidence,
  };
}

/**
 * Calculate current streak from recent games
 * Returns positive for win streak, negative for loss streak
 */
function getStreak(games: RecentGame[]): number {
  if (games.length === 0) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...games].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  let streak = 0;
  const firstResult = sorted[0].result;

  // Count consecutive same results
  for (const game of sorted) {
    if (game.result === firstResult) {
      streak++;
    } else {
      break;
    }
  }

  // Return positive for wins, negative for losses, 0 for draws
  if (firstResult === 'win') return streak;
  if (firstResult === 'loss') return -streak;
  return 0;
}

/**
 * Get sport-specific weight for streak factor
 */
function getStreakWeight(sport: Sport): number {
  const weights: Record<Sport, number> = {
    nfl: 0.08,
    nba: 0.08,
    mlb: 0.08,
    nhl: 0.08,
    soccer: 0.08,
  };
  return weights[sport];
}

/**
 * Calculate streak impact on win probability
 * Used to adjust base probability
 */
export function getStreakAdjustment(
  homeGames: RecentGame[],
  awayGames: RecentGame[]
): number {
  const homeStreak = getStreak(homeGames);
  const awayStreak = getStreak(awayGames);

  // Each game of streak difference = ~1% probability adjustment
  // Capped at +/- 8%
  const adjustment = (homeStreak - awayStreak) * 0.01;
  return Math.max(-0.08, Math.min(0.08, adjustment));
}
