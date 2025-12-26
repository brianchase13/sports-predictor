import { Game, Prediction, PredictionFactor, Sport, Team } from './types';
import { v4 as uuid } from 'uuid';
import {
  calculateAllFactors,
  factorsToDisplayFormat,
  GameContext,
} from './factors';
import { RecentGame } from './factors/types';

// Elo calculation constants
const BASE_ELO = 1500;
const HOME_ADVANTAGE = 65; // Home team Elo bonus

// Sport-specific adjustments based on historical data
const SPORT_CONFIG: Record<Sport, {
  homeAdvantage: number;
  drawPossible: boolean;
  baseDrawRate: number;
  avgGamesPerSeason: number;
}> = {
  nfl: { homeAdvantage: 48, drawPossible: false, baseDrawRate: 0, avgGamesPerSeason: 17 },
  nba: { homeAdvantage: 100, drawPossible: false, baseDrawRate: 0, avgGamesPerSeason: 82 },
  mlb: { homeAdvantage: 24, drawPossible: false, baseDrawRate: 0, avgGamesPerSeason: 162 },
  nhl: { homeAdvantage: 50, drawPossible: true, baseDrawRate: 0.06, avgGamesPerSeason: 82 },
  soccer: { homeAdvantage: 80, drawPossible: true, baseDrawRate: 0.26, avgGamesPerSeason: 38 },
};

/**
 * Calculate dynamic Elo rating based on team's record
 * Teams with better records get higher ratings
 */
function calculateDynamicElo(team: Team): number {
  if (!team.record) return BASE_ELO;

  const { wins, losses, draws = 0 } = team.record;
  const totalGames = wins + losses + draws;

  if (totalGames === 0) return BASE_ELO;

  // Calculate win percentage (draws count as 0.5)
  const winPct = (wins + draws * 0.5) / totalGames;

  // Convert win percentage to Elo-like rating
  // A .500 team = 1500, .750 team ≈ 1650, .250 team ≈ 1350
  const eloAdjustment = (winPct - 0.5) * 300;

  // Apply confidence based on games played (more games = more reliable)
  const sportConfig = SPORT_CONFIG[team.sport];
  const gamesWeight = Math.min(1, totalGames / (sportConfig.avgGamesPerSeason * 0.3));

  return BASE_ELO + (eloAdjustment * gamesWeight);
}

/**
 * Calculate expected win probability using Elo ratings
 */
export function calculateEloProbability(
  homeRating: number,
  awayRating: number,
  homeAdvantage: number = HOME_ADVANTAGE
): { home: number; away: number } {
  const adjustedHomeRating = homeRating + homeAdvantage;
  const exponent = (awayRating - adjustedHomeRating) / 400;
  const homeProb = 1 / (1 + Math.pow(10, exponent));

  return {
    home: homeProb,
    away: 1 - homeProb,
  };
}

/**
 * Calculate new Elo ratings after a game
 */
export function calculateNewElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): { winner: number; loser: number; change: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const change = Math.round(kFactor * (1 - expectedWinner));

  return {
    winner: winnerRating + change,
    loser: loserRating - change,
    change,
  };
}

/**
 * Generate prediction factors for analysis
 */
function generatePredictionFactors(
  game: Game,
  homeElo: number,
  awayElo: number
): PredictionFactor[] {
  const factors: PredictionFactor[] = [];
  const sportConfig = SPORT_CONFIG[game.sport];

  // Record-based strength factor
  const eloDiff = homeElo - awayElo;
  const strongerTeam = eloDiff > 0 ? game.homeTeam : game.awayTeam;
  const ratingDiff = Math.abs(eloDiff);

  factors.push({
    name: 'Team Strength',
    value: eloDiff,
    description: ratingDiff < 20
      ? 'Teams are evenly matched based on season record'
      : `${strongerTeam.name} has a stronger season record (+${ratingDiff.toFixed(0)} rating)`,
    weight: 0.45,
  });

  // Home advantage factor
  factors.push({
    name: 'Home Advantage',
    value: sportConfig.homeAdvantage,
    description: `${game.homeTeam.name} playing at home (+${sportConfig.homeAdvantage} rating advantage)`,
    weight: 0.25,
  });

  // Win percentage comparison
  const homeWinPct = game.homeTeam.record
    ? (game.homeTeam.record.wins + (game.homeTeam.record.draws || 0) * 0.5) /
      (game.homeTeam.record.wins + game.homeTeam.record.losses + (game.homeTeam.record.draws || 0))
    : 0.5;
  const awayWinPct = game.awayTeam.record
    ? (game.awayTeam.record.wins + (game.awayTeam.record.draws || 0) * 0.5) /
      (game.awayTeam.record.wins + game.awayTeam.record.losses + (game.awayTeam.record.draws || 0))
    : 0.5;
  const winPctDiff = homeWinPct - awayWinPct;

  factors.push({
    name: 'Season Performance',
    value: winPctDiff,
    description: Math.abs(winPctDiff) < 0.05
      ? 'Similar win percentages this season'
      : `${winPctDiff > 0 ? game.homeTeam.name : game.awayTeam.name} has ${Math.abs(winPctDiff * 100).toFixed(0)}% better win rate`,
    weight: 0.30,
  });

  return factors;
}

/**
 * Generate a prediction for a game - NO random noise, purely data-driven
 */
export function generatePrediction(game: Game): Prediction {
  const sportConfig = SPORT_CONFIG[game.sport];

  // Calculate dynamic Elo ratings from actual records
  const homeElo = calculateDynamicElo(game.homeTeam);
  const awayElo = calculateDynamicElo(game.awayTeam);

  // Calculate base probabilities from Elo
  const eloProbs = calculateEloProbability(
    homeElo,
    awayElo,
    sportConfig.homeAdvantage
  );

  let homeProb = eloProbs.home;
  let awayProb = eloProbs.away;
  let drawProb = 0;

  // Handle draw probability for applicable sports
  if (sportConfig.drawPossible) {
    // Draws are more likely when teams are evenly matched
    const probDiff = Math.abs(homeProb - awayProb);
    drawProb = sportConfig.baseDrawRate * (1 - probDiff * 0.5);

    // Adjust other probabilities
    const remaining = 1 - drawProb;
    homeProb = (homeProb / (homeProb + awayProb)) * remaining;
    awayProb = remaining - homeProb;
  }

  // Determine predicted winner based on highest probability
  let predictedWinner: 'home' | 'away' | 'draw';
  let winningProb: number;

  if (sportConfig.drawPossible && drawProb > homeProb && drawProb > awayProb) {
    predictedWinner = 'draw';
    winningProb = drawProb;
  } else if (homeProb >= awayProb) {
    predictedWinner = 'home';
    winningProb = homeProb;
  } else {
    predictedWinner = 'away';
    winningProb = awayProb;
  }

  // Confidence is the win probability of the predicted winner (as a percentage)
  // This ensures the confidence badge matches the displayed win probability
  const confidence = Math.round(winningProb * 100);

  // Generate prediction factors
  const factors = generatePredictionFactors(game, homeElo, awayElo);

  return {
    id: uuid(),
    gameId: game.id,
    game,
    predictedWinner,
    predictedWinnerTeam: predictedWinner === 'home' ? game.homeTeam : predictedWinner === 'away' ? game.awayTeam : undefined,
    confidence,
    mlProbability: winningProb,
    homeWinProbability: homeProb,
    awayWinProbability: awayProb,
    drawProbability: drawProb > 0 ? drawProb : undefined,
    factors,
    createdAt: new Date(),
    correct: null,
  };
}

/**
 * Generate predictions for multiple games
 */
export function generatePredictions(games: Game[]): Prediction[] {
  return games.map(generatePrediction);
}

/**
 * Extended prediction context with historical data
 */
export interface EnhancedPredictionContext {
  game: Game;
  homeRecentGames: RecentGame[];
  awayRecentGames: RecentGame[];
  homeLastGameDate?: Date;
  awayLastGameDate?: Date;
}

/**
 * Generate an enhanced prediction using 10+ factors
 * This is the main prediction function that should be used with historical data
 */
export function generateEnhancedPrediction(
  context: EnhancedPredictionContext
): Prediction {
  const { game } = context;
  const sportConfig = SPORT_CONFIG[game.sport];

  // Calculate dynamic Elo ratings from actual records
  const homeElo = calculateDynamicElo(game.homeTeam);
  const awayElo = calculateDynamicElo(game.awayTeam);

  // Get base probabilities from Elo
  const eloProbs = calculateEloProbability(
    homeElo,
    awayElo,
    sportConfig.homeAdvantage
  );

  // Calculate all factors
  const gameContext: GameContext = {
    game,
    homeRecentGames: context.homeRecentGames,
    awayRecentGames: context.awayRecentGames,
    homeLastGameDate: context.homeLastGameDate,
    awayLastGameDate: context.awayLastGameDate,
  };

  const gameFactors = calculateAllFactors(gameContext);

  // Adjust probabilities based on factors
  // Combined score ranges from -1 (strongly favor away) to +1 (strongly favor home)
  const factorAdjustment = gameFactors.combinedScore * 0.12; // Max 12% adjustment

  let homeProb = eloProbs.home + factorAdjustment;
  let awayProb = eloProbs.away - factorAdjustment;

  // Clamp probabilities
  homeProb = Math.max(0.1, Math.min(0.9, homeProb));
  awayProb = Math.max(0.1, Math.min(0.9, awayProb));

  // Normalize
  const total = homeProb + awayProb;
  homeProb = homeProb / total;
  awayProb = awayProb / total;

  let drawProb = 0;

  // Handle draw probability for applicable sports
  if (sportConfig.drawPossible) {
    const probDiff = Math.abs(homeProb - awayProb);
    drawProb = sportConfig.baseDrawRate * (1 - probDiff * 0.5);

    const remaining = 1 - drawProb;
    homeProb = (homeProb / (homeProb + awayProb)) * remaining;
    awayProb = remaining - homeProb;
  }

  // Determine predicted winner
  let predictedWinner: 'home' | 'away' | 'draw';
  let winningProb: number;

  if (sportConfig.drawPossible && drawProb > homeProb && drawProb > awayProb) {
    predictedWinner = 'draw';
    winningProb = drawProb;
  } else if (homeProb >= awayProb) {
    predictedWinner = 'home';
    winningProb = homeProb;
  } else {
    predictedWinner = 'away';
    winningProb = awayProb;
  }

  // Confidence is the win probability of the predicted winner (as a percentage)
  // This ensures the confidence badge matches the displayed win probability
  const confidence = Math.round(winningProb * 100);

  // Convert factors to display format
  const displayFactors = factorsToDisplayFormat(gameFactors.factors);

  return {
    id: uuid(),
    gameId: game.id,
    game,
    predictedWinner,
    predictedWinnerTeam:
      predictedWinner === 'home'
        ? game.homeTeam
        : predictedWinner === 'away'
          ? game.awayTeam
          : undefined,
    confidence,
    mlProbability: winningProb,
    homeWinProbability: homeProb,
    awayWinProbability: awayProb,
    drawProbability: drawProb > 0 ? drawProb : undefined,
    factors: displayFactors,
    createdAt: new Date(),
    correct: null,
  };
}

/**
 * Generate enhanced predictions for multiple games with context
 */
export function generateEnhancedPredictions(
  contexts: EnhancedPredictionContext[]
): Prediction[] {
  return contexts.map(generateEnhancedPrediction);
}
