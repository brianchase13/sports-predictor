import { SportPromptConfig } from './index';

export const nhlPromptConfig: SportPromptConfig = {
  sport: 'nhl',
  sportName: 'NHL Hockey',
  keyMetrics: [
    'Goals for and goals against per game',
    'Power play percentage and penalty kill percentage',
    'Starting goalie save percentage and goals against average',
    'Shot differential (Corsi/Fenwick)',
    'Expected goals (xG) for and against',
    'Faceoff win percentage',
    'Hits and blocked shots',
    'Goals scored by period (1st/2nd/3rd)',
  ],
  riskPatterns: [
    'Goalie is crucial - starter vs backup is major difference',
    'Back-to-back games impact performance significantly',
    'Teams on long road trips see fatigue',
    'Playoff races increase intensity late season',
    'Revenge games after lopsided losses',
    'Special teams (PP/PK) often decide close games',
    'Overtime games have random outcomes (3v3 format)',
    'Teams resting players for playoffs',
  ],
  analysisFocus:
    'NHL games are often decided by goaltending and special teams. ' +
    'Starting goalie confirmation is essential for prediction. ' +
    'Puck luck (bounces, deflections) adds randomness. ' +
    'Overtime is essentially a coin flip.',
  scoringTerms: {
    unit: 'goals',
    highScoring: 7,
    lowScoring: 4,
  },
  positionImportance: [
    'Starting Goalie - Most impactful single player',
    'Top-line center - Offensive driver',
    'First-pair defenseman - Both ends of ice',
    'Power play quarterback - PP specialist',
  ],
  homeAdvantageContext:
    'NHL home advantage is worth about 0.15 goals. ' +
    'Last change allows favorable matchups. ' +
    'Altitude affects some players (Denver, Calgary).',
  weatherRelevance: false, // Indoor sport
  customInstructions:
    'Always note which goalie is starting. ' +
    'Back-to-back situations heavily favor the rested team. ' +
    'Check power play and penalty kill stats for special teams battle. ' +
    'Late-season games may feature AHL call-ups.',
};
