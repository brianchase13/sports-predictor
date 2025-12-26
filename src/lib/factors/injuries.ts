import { Sport } from '../types';
import { FactorResult, FACTOR_WEIGHTS } from './types';
import { TeamInjuryReport } from '../data-sources/injuries';

/**
 * Injury context for factor calculation
 */
export interface InjuryContext {
  homeInjuries?: TeamInjuryReport;
  awayInjuries?: TeamInjuryReport;
}

/**
 * Calculate the injury factor for a game
 * Positive score = home team is healthier (advantage)
 * Negative score = away team is healthier
 */
export function calculateInjuryFactor(
  homeInjuries: TeamInjuryReport | undefined,
  awayInjuries: TeamInjuryReport | undefined,
  sport: Sport
): FactorResult {
  const weight = getInjuryWeight(sport);

  // No injury data available
  if (!homeInjuries && !awayInjuries) {
    return {
      name: 'Injuries',
      value: 0,
      normalizedScore: 0,
      weight,
      description: 'No injury data available',
      confidence: 0,
    };
  }

  // Calculate health scores (default to 1.0 if no data)
  const homeHealth = homeInjuries?.healthScore ?? 1.0;
  const awayHealth = awayInjuries?.healthScore ?? 1.0;

  // Health difference: positive = home healthier
  const healthDiff = homeHealth - awayHealth;

  // Normalize to -1 to +1 range
  // Max expected difference is about 0.5 (one team fully healthy, other very injured)
  const normalizedScore = Math.max(-1, Math.min(1, healthDiff * 2));

  // Calculate confidence based on data availability
  const confidence = calculateInjuryConfidence(homeInjuries, awayInjuries);

  // Generate description
  const description = generateInjuryDescription(
    homeInjuries,
    awayInjuries,
    healthDiff
  );

  return {
    name: 'Injuries',
    value: healthDiff * 100,
    normalizedScore,
    weight,
    description,
    confidence,
  };
}

/**
 * Get injury weight by sport
 * Some sports are more affected by individual injuries
 */
function getInjuryWeight(sport: Sport): number {
  // Injuries have different impacts by sport
  const weights: Record<Sport, number> = {
    nfl: 0.12, // QB injury can swing a game
    nba: 0.10, // Star player impact is high
    mlb: 0.08, // Pitching matters, but large rosters
    nhl: 0.08, // Goalie is crucial, but depth matters
    soccer: 0.08, // Key players matter
  };

  return weights[sport];
}

/**
 * Calculate confidence in injury factor
 */
function calculateInjuryConfidence(
  homeInjuries?: TeamInjuryReport,
  awayInjuries?: TeamInjuryReport
): number {
  if (!homeInjuries && !awayInjuries) return 0;
  if (!homeInjuries || !awayInjuries) return 0.5;

  // Check data freshness (within last 6 hours is best)
  const now = Date.now();
  const homeAge = now - new Date(homeInjuries.lastUpdated).getTime();
  const awayAge = now - new Date(awayInjuries.lastUpdated).getTime();

  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;

  let confidence = 1.0;

  // Reduce confidence for older data
  if (homeAge > ONE_DAY || awayAge > ONE_DAY) {
    confidence *= 0.5;
  } else if (homeAge > SIX_HOURS || awayAge > SIX_HOURS) {
    confidence *= 0.8;
  }

  return confidence;
}

/**
 * Generate human-readable description of injury impact
 */
function generateInjuryDescription(
  homeInjuries?: TeamInjuryReport,
  awayInjuries?: TeamInjuryReport,
  healthDiff?: number
): string {
  if (!homeInjuries && !awayInjuries) {
    return 'No injury data available';
  }

  const parts: string[] = [];

  // Home team injuries
  if (homeInjuries && homeInjuries.keyPlayersOut.length > 0) {
    parts.push(
      `${homeInjuries.teamName} missing: ${homeInjuries.keyPlayersOut.slice(0, 3).join(', ')}`
    );
  }

  // Away team injuries
  if (awayInjuries && awayInjuries.keyPlayersOut.length > 0) {
    parts.push(
      `${awayInjuries.teamName} missing: ${awayInjuries.keyPlayersOut.slice(0, 3).join(', ')}`
    );
  }

  // If no key players out, describe health status
  if (parts.length === 0) {
    if (healthDiff && Math.abs(healthDiff) >= 0.1) {
      const healthierTeam =
        healthDiff > 0 ? homeInjuries?.teamName : awayInjuries?.teamName;
      return `${healthierTeam} has healthier roster`;
    }
    return 'Both teams relatively healthy';
  }

  // Add overall comparison if significant
  if (healthDiff && Math.abs(healthDiff) >= 0.2) {
    const advantage = healthDiff > 0 ? 'Home' : 'Away';
    parts.push(`${advantage} has health advantage`);
  }

  return parts.join('. ');
}

/**
 * Get injury summary for LLM analysis
 */
export function getInjurySummaryForLLM(
  homeInjuries?: TeamInjuryReport,
  awayInjuries?: TeamInjuryReport
): string {
  const lines: string[] = [];

  if (homeInjuries) {
    lines.push(`${homeInjuries.teamName} Injury Report:`);
    if (homeInjuries.injuries.length === 0) {
      lines.push('  - Fully healthy');
    } else {
      lines.push(`  - Team Health Score: ${(homeInjuries.healthScore * 100).toFixed(0)}%`);
      lines.push(`  - Starters Out: ${homeInjuries.startersOut}`);
      if (homeInjuries.keyPlayersOut.length > 0) {
        lines.push(`  - Key Players Out: ${homeInjuries.keyPlayersOut.join(', ')}`);
      }
      // List all injuries with status
      for (const injury of homeInjuries.injuries.slice(0, 5)) {
        lines.push(
          `  - ${injury.playerName} (${injury.position}): ${injury.status.toUpperCase()}${injury.description ? ` - ${injury.description}` : ''}`
        );
      }
      if (homeInjuries.injuries.length > 5) {
        lines.push(`  - ... and ${homeInjuries.injuries.length - 5} more`);
      }
    }
  } else {
    lines.push('Home Team: No injury data available');
  }

  lines.push('');

  if (awayInjuries) {
    lines.push(`${awayInjuries.teamName} Injury Report:`);
    if (awayInjuries.injuries.length === 0) {
      lines.push('  - Fully healthy');
    } else {
      lines.push(`  - Team Health Score: ${(awayInjuries.healthScore * 100).toFixed(0)}%`);
      lines.push(`  - Starters Out: ${awayInjuries.startersOut}`);
      if (awayInjuries.keyPlayersOut.length > 0) {
        lines.push(`  - Key Players Out: ${awayInjuries.keyPlayersOut.join(', ')}`);
      }
      for (const injury of awayInjuries.injuries.slice(0, 5)) {
        lines.push(
          `  - ${injury.playerName} (${injury.position}): ${injury.status.toUpperCase()}${injury.description ? ` - ${injury.description}` : ''}`
        );
      }
      if (awayInjuries.injuries.length > 5) {
        lines.push(`  - ... and ${awayInjuries.injuries.length - 5} more`);
      }
    }
  } else {
    lines.push('Away Team: No injury data available');
  }

  return lines.join('\n');
}
