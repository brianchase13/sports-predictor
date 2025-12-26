import { SportPromptConfig } from './index';

export const nflPromptConfig: SportPromptConfig = {
  sport: 'nfl',
  sportName: 'NFL Football',
  keyMetrics: [
    'Quarterback performance (passer rating, completion %, turnovers)',
    'Turnover differential (takeaways vs giveaways)',
    'Red zone efficiency (TDs vs FGs inside the 20)',
    'Third down conversion rate',
    'Rushing attack effectiveness vs defensive run stop rate',
    'Pressure/sack rate for pass rush',
    'Points per game and points allowed',
    'Time of possession and play count',
  ],
  riskPatterns: [
    'Divisional games are often closer regardless of record',
    'Teams coming off bye weeks have a statistical advantage',
    'Cold weather significantly affects passing teams from warm climates',
    'West coast teams traveling east for early games (body clock)',
    'Thursday Night Football for non-bye teams (short rest)',
    'Backup quarterback situations drastically change spreads',
    'Late-season games with playoff implications vs eliminated teams',
  ],
  analysisFocus:
    'NFL games are often decided by turnovers and red zone efficiency. ' +
    'Quarterback play is the most important factor. ' +
    'Weather affects passing more than rushing. ' +
    'Home field is worth approximately 2.5-3 points.',
  scoringTerms: {
    unit: 'points',
    highScoring: 50,
    lowScoring: 35,
  },
  positionImportance: [
    'QB (Quarterback) - Most important',
    'LT (Left Tackle) - Protects QB blind side',
    'EDGE/DE (Pass Rusher) - Disrupts offense',
    'CB (Cornerback) - Covers receivers',
  ],
  homeAdvantageContext:
    'NFL home advantage is worth roughly 2.5-3 points. ' +
    'Dome teams have larger home edge. ' +
    'Crowd noise significantly impacts offense communication.',
  weatherRelevance: true,
  customInstructions:
    'Note any key injuries, especially at QB, OL, or primary pass rusher. ' +
    'Divisional games often defy records. ' +
    'Consider rest advantage from bye weeks.',
};
