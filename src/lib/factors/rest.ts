import { Sport } from '../types';
import { FactorResult } from './types';

// Sport-specific optimal rest days and back-to-back penalties
const REST_CONFIG: Record<Sport, {
  optimalDays: number;
  maxBenefit: number;
  b2bPenalty: number; // Penalty for back-to-back games
}> = {
  nfl: {
    optimalDays: 7,
    maxBenefit: 14,
    b2bPenalty: 0.15, // Very rare but significant
  },
  nba: {
    optimalDays: 2,
    maxBenefit: 4,
    b2bPenalty: 0.08, // Common and impactful
  },
  mlb: {
    optimalDays: 1,
    maxBenefit: 2,
    b2bPenalty: 0.02, // Designed for daily play
  },
  nhl: {
    optimalDays: 2,
    maxBenefit: 4,
    b2bPenalty: 0.06, // Moderate impact
  },
  soccer: {
    optimalDays: 4,
    maxBenefit: 7,
    b2bPenalty: 0.10, // Significant impact
  },
};

/**
 * Calculate rest days factor
 * More rest = generally better, but sport-specific
 */
export function calculateRestFactor(
  homeLastGame: Date | undefined,
  awayLastGame: Date | undefined,
  gameDate: Date,
  sport: Sport
): FactorResult {
  const config = REST_CONFIG[sport];

  const homeRest = homeLastGame
    ? getDaysBetween(homeLastGame, gameDate)
    : config.optimalDays;
  const awayRest = awayLastGame
    ? getDaysBetween(awayLastGame, gameDate)
    : config.optimalDays;

  // Calculate rest advantage (positive = home has more rest)
  const homeRestScore = calculateRestScore(homeRest, config);
  const awayRestScore = calculateRestScore(awayRest, config);
  const restDiff = homeRestScore - awayRestScore;

  // Normalize to -1 to +1
  const normalizedScore = Math.max(-1, Math.min(1, restDiff));

  // Confidence based on whether we have actual data
  const confidence = (homeLastGame && awayLastGame) ? 1 : 0.3;

  // Generate description
  let description: string;
  const homeB2B = homeRest <= 1;
  const awayB2B = awayRest <= 1;

  if (homeB2B && !awayB2B) {
    description = `Home team on back-to-back (${homeRest} day rest) vs away (${awayRest} days)`;
  } else if (awayB2B && !homeB2B) {
    description = `Away team on back-to-back (${awayRest} day rest) vs home (${homeRest} days)`;
  } else if (Math.abs(homeRest - awayRest) >= 2) {
    description = `Rest advantage: Home (${homeRest} days) vs Away (${awayRest} days)`;
  } else {
    description = `Similar rest: Home (${homeRest} days) vs Away (${awayRest} days)`;
  }

  return {
    name: 'Rest Days',
    value: homeRest - awayRest,
    normalizedScore,
    weight: getRestWeight(sport),
    description,
    confidence,
  };
}

/**
 * Calculate rest score based on sport-specific config
 */
function calculateRestScore(
  days: number,
  config: { optimalDays: number; maxBenefit: number; b2bPenalty: number }
): number {
  // Back-to-back penalty
  if (days <= 1) {
    return -config.b2bPenalty;
  }

  // Optimal rest gives max benefit
  if (days >= config.optimalDays) {
    const extraBenefit = Math.min(
      days - config.optimalDays,
      config.maxBenefit - config.optimalDays
    );
    return 0.5 + (extraBenefit * 0.05);
  }

  // Less than optimal but not B2B
  const ratio = days / config.optimalDays;
  return ratio * 0.5;
}

/**
 * Get days between two dates
 */
function getDaysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get sport-specific weight for rest factor
 */
function getRestWeight(sport: Sport): number {
  const weights: Record<Sport, number> = {
    nfl: 0.10,
    nba: 0.12, // B2B games very common and impactful
    mlb: 0.05,
    nhl: 0.10,
    soccer: 0.08,
  };
  return weights[sport];
}

/**
 * Calculate probability adjustment based on rest
 */
export function getRestAdjustment(
  homeLastGame: Date | undefined,
  awayLastGame: Date | undefined,
  gameDate: Date,
  sport: Sport
): number {
  const factor = calculateRestFactor(homeLastGame, awayLastGame, gameDate, sport);
  return factor.normalizedScore * factor.weight;
}
