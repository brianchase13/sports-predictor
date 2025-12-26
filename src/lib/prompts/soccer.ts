import { SportPromptConfig } from './index';

export const soccerPromptConfig: SportPromptConfig = {
  sport: 'soccer',
  sportName: 'Soccer/Football',
  keyMetrics: [
    'Expected goals (xG) for and against',
    'Goals scored and conceded per game',
    'Clean sheets percentage',
    'Possession percentage',
    'Shots on target per game',
    'Home vs away record split',
    'Points per game',
    'Goals from set pieces',
  ],
  riskPatterns: [
    'Draws are common (25-30% of games)',
    'Fixture congestion (European matches midweek)',
    'Cup games between league matches cause rotation',
    'Away form is often significantly worse than home',
    'Derbies/rivalries transcend form',
    'Teams with nothing to play for late season',
    'Newly promoted teams overperform early season',
    'Manager changes cause short-term volatility',
  ],
  analysisFocus:
    'Soccer has the highest draw rate of major sports. ' +
    'Low-scoring nature means upsets are common. ' +
    'Squad rotation for fixture congestion is key. ' +
    'Away teams often play more defensively.',
  scoringTerms: {
    unit: 'goals',
    highScoring: 4,
    lowScoring: 2,
  },
  positionImportance: [
    'Goalkeeper - Clean sheets matter',
    'Striker - Goals are scarce',
    'Central midfielder - Controls tempo',
    'Center back - Defensive solidity',
  ],
  homeAdvantageContext:
    'Soccer home advantage is substantial (60%+ home win rate historically). ' +
    'Crowd atmosphere directly impacts players. ' +
    'Travel fatigue for away European matches.',
  weatherRelevance: true,
  customInstructions:
    'Always consider the possibility of a draw. ' +
    'Check for midweek European/cup games causing rotation. ' +
    'Manager changes create unpredictable results. ' +
    'Note the competition (league vs cup vs European).',
};
