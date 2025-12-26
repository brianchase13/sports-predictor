import { SportPromptConfig } from './index';

export const nbaPromptConfig: SportPromptConfig = {
  sport: 'nba',
  sportName: 'NBA Basketball',
  keyMetrics: [
    'Offensive rating (points per 100 possessions)',
    'Defensive rating (points allowed per 100 possessions)',
    'Net rating (offensive - defensive rating)',
    'Pace (possessions per game)',
    'Three-point shooting percentage and volume',
    'Free throw rate and percentage',
    'Rebounding (offensive and defensive)',
    'Turnover rate and assists per game',
  ],
  riskPatterns: [
    'Back-to-back games significantly impact performance (-3 to -5 pts)',
    'Third game in four nights is particularly draining',
    'Altitude adjustment in Denver affects visiting teams',
    'Load management for star players in regular season',
    'West coast to east coast travel for early games',
    'Trap games before marquee matchups',
    'Teams clinching playoff spots may rest players',
    'End of season tank scenarios',
  ],
  analysisFocus:
    'NBA is heavily influenced by rest and travel. ' +
    'Star player availability is crucial - one player can swing games 5+ points. ' +
    'Pace matchups matter: slow teams struggle vs uptempo. ' +
    'Three-point variance can cause upsets.',
  scoringTerms: {
    unit: 'points',
    highScoring: 230,
    lowScoring: 200,
  },
  positionImportance: [
    'Star players (top 2-3 scorers) - Most impactful',
    'Point Guard - Orchestrates offense',
    'Center - Paint protection and rebounding',
    'Primary defender on opposing star',
  ],
  homeAdvantageContext:
    'NBA home court is worth 3-4 points. ' +
    'Some arenas have notably loud crowds (Memphis, Golden State). ' +
    'Altitude in Denver (5,280 ft) affects conditioning.',
  weatherRelevance: false, // Indoor sport
  customInstructions:
    'Always check for back-to-back scenarios. ' +
    'Star player rest or injury is critical. ' +
    'Late-season games may feature lineup changes. ' +
    'Playoff seeding can motivate or cause rest.',
};
