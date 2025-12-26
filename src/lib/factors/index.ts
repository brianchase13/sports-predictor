import { Game, Sport } from '../types';
import {
  FactorResult,
  GameFactors,
  RecentGame,
  FACTOR_WEIGHTS,
} from './types';
import { calculateStreakFactor, getStreakAdjustment } from './streak';
import { calculateRestFactor, getRestAdjustment } from './rest';
import {
  calculateMomentumFactor,
  calculateScoringTrendFactor,
  calculateDefensiveTrendFactor,
  getMomentumAdjustment,
} from './momentum';
import { calculateSeasonPhaseFactor, getEarlySeasonPenalty } from './seasonPhase';
import {
  calculateHeadToHeadFactor,
  extractHeadToHeadFromRecentGames,
  HeadToHeadRecord,
} from './head-to-head';
import { calculateInjuryFactor, getInjurySummaryForLLM } from './injuries';
import { TeamInjuryReport } from '../data-sources/injuries';
import { calculateWeatherFactor, getWeatherSummaryForLLM } from './weather';
import { WeatherConditions } from '../data-sources/weather';

export * from './types';
export * from './streak';
export * from './rest';
export * from './momentum';
export * from './seasonPhase';
export * from './head-to-head';
export * from './injuries';
export * from './weather';

/**
 * Context needed to calculate all factors for a game
 */
export interface GameContext {
  game: Game;
  homeRecentGames: RecentGame[];
  awayRecentGames: RecentGame[];
  homeLastGameDate?: Date;
  awayLastGameDate?: Date;
  homeSeasonAvgScore?: number;
  awaySeasonAvgScore?: number;
  homeSeasonAvgAllowed?: number;
  awaySeasonAvgAllowed?: number;
  headToHead?: HeadToHeadRecord;
  homeInjuries?: TeamInjuryReport;
  awayInjuries?: TeamInjuryReport;
  weather?: WeatherConditions;
}

/**
 * Calculate all factors for a game
 */
export function calculateAllFactors(context: GameContext): GameFactors {
  const { game } = context;
  const sport = game.sport;
  const factors: FactorResult[] = [];

  // 1. Team Strength (Elo-based) - calculated in prediction engine
  const homeRecord = game.homeTeam.record || { wins: 0, losses: 0 };
  const awayRecord = game.awayTeam.record || { wins: 0, losses: 0 };

  const homeWinPct =
    (homeRecord.wins + (homeRecord.draws || 0) * 0.5) /
    Math.max(1, homeRecord.wins + homeRecord.losses + (homeRecord.draws || 0));
  const awayWinPct =
    (awayRecord.wins + (awayRecord.draws || 0) * 0.5) /
    Math.max(1, awayRecord.wins + awayRecord.losses + (awayRecord.draws || 0));

  factors.push({
    name: 'Team Strength',
    value: (homeWinPct - awayWinPct) * 100,
    normalizedScore: Math.max(-1, Math.min(1, (homeWinPct - awayWinPct) * 2)),
    weight: FACTOR_WEIGHTS[sport].teamStrength,
    description:
      Math.abs(homeWinPct - awayWinPct) < 0.1
        ? 'Teams are evenly matched based on season record'
        : homeWinPct > awayWinPct
          ? `${game.homeTeam.name} has stronger record (${(homeWinPct * 100).toFixed(0)}% vs ${(awayWinPct * 100).toFixed(0)}%)`
          : `${game.awayTeam.name} has stronger record (${(awayWinPct * 100).toFixed(0)}% vs ${(homeWinPct * 100).toFixed(0)}%)`,
    confidence: calculateRecordConfidence(homeRecord, awayRecord),
  });

  // 2. Home Advantage
  const homeAdvWeight = FACTOR_WEIGHTS[sport].homeAdvantage;
  factors.push({
    name: 'Home Advantage',
    value: homeAdvWeight * 100,
    normalizedScore: getHomeAdvantageScore(sport),
    weight: homeAdvWeight,
    description: `${game.homeTeam.name} playing at home (${game.venue || 'home venue'})`,
    confidence: 0.9,
  });

  // 3. Win/Loss Streak
  if (context.homeRecentGames.length > 0 || context.awayRecentGames.length > 0) {
    factors.push(
      calculateStreakFactor(
        context.homeRecentGames,
        context.awayRecentGames,
        sport
      )
    );
  }

  // 4. Rest Days
  factors.push(
    calculateRestFactor(
      context.homeLastGameDate,
      context.awayLastGameDate,
      game.startTime,
      sport
    )
  );

  // 5. Recent Form/Momentum
  if (context.homeRecentGames.length > 0 || context.awayRecentGames.length > 0) {
    factors.push(
      calculateMomentumFactor(
        context.homeRecentGames,
        context.awayRecentGames,
        sport
      )
    );
  }

  // 6. Scoring Trend
  if (context.homeSeasonAvgScore && context.awaySeasonAvgScore) {
    factors.push(
      calculateScoringTrendFactor(
        context.homeRecentGames,
        context.awayRecentGames,
        context.homeSeasonAvgScore,
        context.awaySeasonAvgScore,
        sport
      )
    );
  }

  // 7. Defensive Trend
  if (context.homeSeasonAvgAllowed && context.awaySeasonAvgAllowed) {
    factors.push(
      calculateDefensiveTrendFactor(
        context.homeRecentGames,
        context.awayRecentGames,
        context.homeSeasonAvgAllowed,
        context.awaySeasonAvgAllowed,
        sport
      )
    );
  }

  // 8. Season Phase
  const homeGamesPlayed =
    homeRecord.wins + homeRecord.losses + (homeRecord.draws || 0);
  const awayGamesPlayed =
    awayRecord.wins + awayRecord.losses + (awayRecord.draws || 0);

  factors.push(
    calculateSeasonPhaseFactor(
      homeGamesPlayed,
      awayGamesPlayed,
      homeRecord,
      awayRecord,
      sport
    )
  );

  // 9. Head-to-Head History
  // Extract H2H from recent games if not provided directly
  const h2h =
    context.headToHead ||
    extractHeadToHeadFromRecentGames(
      game.homeTeam.id,
      game.homeTeam.name,
      game.awayTeam.id,
      game.awayTeam.name,
      context.homeRecentGames,
      context.awayRecentGames
    );

  factors.push(calculateHeadToHeadFactor(h2h, sport));

  // 10. Injury Factor
  if (context.homeInjuries || context.awayInjuries) {
    factors.push(
      calculateInjuryFactor(
        context.homeInjuries,
        context.awayInjuries,
        sport
      )
    );
  }

  // 11. Weather Factor (outdoor sports only)
  if (context.weather) {
    factors.push(calculateWeatherFactor(context.weather, sport));
  }

  // Calculate combined score (weighted average)
  let totalWeight = 0;
  let weightedSum = 0;

  for (const factor of factors) {
    weightedSum += factor.normalizedScore * factor.weight * factor.confidence;
    totalWeight += factor.weight * factor.confidence;
  }

  const combinedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Convert combined score to advantages
  // Positive score = home advantage, negative = away advantage
  const homeAdvantage = combinedScore > 0 ? combinedScore : 0;
  const awayAdvantage = combinedScore < 0 ? -combinedScore : 0;

  return {
    game,
    factors,
    combinedScore,
    homeAdvantage,
    awayAdvantage,
  };
}

/**
 * Get probability adjustment from all factors
 */
export function getFactorAdjustments(context: GameContext): {
  homeAdjustment: number;
  awayAdjustment: number;
  confidencePenalty: number;
} {
  const factors = calculateAllFactors(context);

  // Convert combined score to probability adjustment
  // Max adjustment of +/- 15%
  const adjustment = factors.combinedScore * 0.15;

  // Early season penalty reduces confidence
  const homeGamesPlayed =
    (context.game.homeTeam.record?.wins || 0) +
    (context.game.homeTeam.record?.losses || 0) +
    (context.game.homeTeam.record?.draws || 0);
  const awayGamesPlayed =
    (context.game.awayTeam.record?.wins || 0) +
    (context.game.awayTeam.record?.losses || 0) +
    (context.game.awayTeam.record?.draws || 0);

  const homePenalty = getEarlySeasonPenalty(
    homeGamesPlayed,
    context.game.sport
  );
  const awayPenalty = getEarlySeasonPenalty(
    awayGamesPlayed,
    context.game.sport
  );
  const confidencePenalty = (homePenalty + awayPenalty) / 2;

  return {
    homeAdjustment: adjustment > 0 ? adjustment : 0,
    awayAdjustment: adjustment < 0 ? -adjustment : 0,
    confidencePenalty,
  };
}

/**
 * Convert factors to PredictionFactor format for display
 */
export function factorsToDisplayFormat(
  factors: FactorResult[]
): Array<{
  name: string;
  value: number;
  description: string;
  weight: number;
}> {
  return factors.map((f) => ({
    name: f.name,
    value: f.normalizedScore * 100, // Convert to percentage
    description: f.description,
    weight: f.weight,
  }));
}

// Helper functions

function calculateRecordConfidence(
  homeRecord: { wins: number; losses: number; draws?: number },
  awayRecord: { wins: number; losses: number; draws?: number }
): number {
  const homeGames =
    homeRecord.wins + homeRecord.losses + (homeRecord.draws || 0);
  const awayGames =
    awayRecord.wins + awayRecord.losses + (awayRecord.draws || 0);

  // Need at least 5 games for reasonable confidence
  const minGames = Math.min(homeGames, awayGames);
  return Math.min(1, minGames / 10);
}

function getHomeAdvantageScore(sport: Sport): number {
  // Normalized home advantage by sport
  const scores: Record<Sport, number> = {
    nfl: 0.4,
    nba: 0.55, // Strong home court in NBA
    mlb: 0.25, // Weaker in baseball
    nhl: 0.45,
    soccer: 0.5,
  };
  return scores[sport];
}
