import { Sport } from '../types';
import { nflPromptConfig } from './nfl';
import { nbaPromptConfig } from './nba';
import { mlbPromptConfig } from './mlb';
import { nhlPromptConfig } from './nhl';
import { soccerPromptConfig } from './soccer';

/**
 * Sport-specific prompt configuration
 */
export interface SportPromptConfig {
  sport: Sport;
  sportName: string;
  keyMetrics: string[];
  riskPatterns: string[];
  analysisFocus: string;
  scoringTerms: {
    unit: string; // "points", "runs", "goals"
    highScoring: number; // Threshold for "high-scoring game"
    lowScoring: number;
  };
  positionImportance: string[]; // Most important positions
  homeAdvantageContext: string;
  weatherRelevance: boolean;
  customInstructions?: string;
}

/**
 * Get prompt configuration for a sport
 */
export function getPromptConfig(sport: Sport): SportPromptConfig {
  const configs: Record<Sport, SportPromptConfig> = {
    nfl: nflPromptConfig,
    nba: nbaPromptConfig,
    mlb: mlbPromptConfig,
    nhl: nhlPromptConfig,
    soccer: soccerPromptConfig,
  };

  return configs[sport];
}

/**
 * Build sport-specific analysis instructions
 */
export function buildSportSpecificInstructions(sport: Sport): string {
  const config = getPromptConfig(sport);

  const lines: string[] = [
    `As an expert ${config.sportName} analyst, focus on these key factors:`,
    '',
    'KEY METRICS TO CONSIDER:',
    ...config.keyMetrics.map((m) => `• ${m}`),
    '',
    'RISK PATTERNS TO WATCH:',
    ...config.riskPatterns.map((r) => `• ${r}`),
    '',
    `ANALYSIS FOCUS: ${config.analysisFocus}`,
    '',
    `HOME ADVANTAGE: ${config.homeAdvantageContext}`,
  ];

  if (config.weatherRelevance) {
    lines.push('', 'WEATHER IMPACT: Consider weather conditions for outdoor games');
  }

  if (config.customInstructions) {
    lines.push('', config.customInstructions);
  }

  return lines.join('\n');
}

/**
 * Get sport-specific terminology for scoring
 */
export function getScoringContext(sport: Sport): string {
  const config = getPromptConfig(sport);
  const { unit, highScoring, lowScoring } = config.scoringTerms;

  return `Scoring is measured in ${unit}. Games above ${highScoring} ${unit} are considered high-scoring; below ${lowScoring} ${unit} is low-scoring.`;
}

export { nflPromptConfig } from './nfl';
export { nbaPromptConfig } from './nba';
export { mlbPromptConfig } from './mlb';
export { nhlPromptConfig } from './nhl';
export { soccerPromptConfig } from './soccer';
