import { SportPromptConfig } from './index';

export const mlbPromptConfig: SportPromptConfig = {
  sport: 'mlb',
  sportName: 'MLB Baseball',
  keyMetrics: [
    'Starting pitcher ERA and WHIP',
    'Starting pitcher strikeout rate (K/9) and walk rate (BB/9)',
    'Team batting average and on-base percentage',
    'Bullpen ERA and save conversion rate',
    'Home run rate (for and against)',
    'Run differential (runs scored - runs allowed)',
    'Batting average with runners in scoring position',
    'Fielding percentage and defensive runs saved',
  ],
  riskPatterns: [
    'Starting pitcher is 80%+ of the prediction for a game',
    'Day game after night game impacts hitters',
    'West coast to east coast travel is draining',
    'Bullpen usage in previous games (tired arms)',
    'Umpire tendencies (strike zone size affects pitchers)',
    'Ballpark factors (Coors Field, Yankee Stadium short porch)',
    'Platoon advantages (lefty vs righty matchups)',
    'Hot streaks and slumps for key hitters',
  ],
  analysisFocus:
    'MLB is a pitching-dominant sport. ' +
    'The starting pitcher matchup is the most important factor. ' +
    'Over 162 games, randomness plays a large role in individual games. ' +
    'Even the best teams lose 60+ games per season.',
  scoringTerms: {
    unit: 'runs',
    highScoring: 10,
    lowScoring: 5,
  },
  positionImportance: [
    'Starting Pitcher - Single most important player',
    'Closer - Critical for holding leads',
    'Cleanup hitter (4th in order) - Run production',
    'Shortstop/Catcher - Defensive impact',
  ],
  homeAdvantageContext:
    'MLB home advantage is modest (about 54% win rate). ' +
    'Batting last gives strategic advantage in close games. ' +
    'Some parks heavily favor pitchers or hitters.',
  weatherRelevance: true,
  customInstructions:
    'Always emphasize the starting pitcher matchup first. ' +
    'Note if a team is on a long road trip. ' +
    'Bullpen availability from recent games matters. ' +
    'Consider the specific ballpark dimensions.',
};
