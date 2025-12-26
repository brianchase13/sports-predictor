import { NextRequest, NextResponse } from 'next/server';
import { fetchUpcomingGames, fetchTodaysGames, fetchGameContext } from '@/lib/sports-api';
import { generateEnhancedPrediction, generatePrediction } from '@/lib/prediction-engine';
import { enrichPredictionWithAnalysis, GameAnalysisContext } from '@/lib/llm-analyzer';
import { RecentGame } from '@/lib/factors/types';
import { PredictionFactor } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, useEnhanced = true } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId is required' },
        { status: 400 }
      );
    }

    // Fetch real games from ESPN API
    const todaysGames = await fetchTodaysGames();
    const upcomingGames = await fetchUpcomingGames();
    const allGames = [...todaysGames, ...upcomingGames];

    // Find the game
    const game = allGames.find((g) => g.id === gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    let basePrediction;
    let analysisContext: GameAnalysisContext | undefined;

    if (useEnhanced) {
      // Fetch team context for enhanced prediction (10+ factors)
      try {
        const { homeSchedule, awaySchedule } = await fetchGameContext(game);

        basePrediction = generateEnhancedPrediction({
          game,
          homeRecentGames: homeSchedule.recentGames,
          awayRecentGames: awaySchedule.recentGames,
          homeLastGameDate: homeSchedule.lastGameDate,
          awayLastGameDate: awaySchedule.lastGameDate,
        });

        // Build analysis context for LLM
        analysisContext = buildAnalysisContext(
          homeSchedule.recentGames,
          awaySchedule.recentGames,
          homeSchedule.lastGameDate,
          awaySchedule.lastGameDate,
          game.startTime,
          basePrediction.factors
        );
      } catch (contextError) {
        console.warn('Failed to fetch game context, using basic prediction:', contextError);
        basePrediction = generatePrediction(game);
      }
    } else {
      // Use basic 3-factor prediction
      basePrediction = generatePrediction(game);
    }

    // Enrich with LLM analysis (pass context for enhanced analysis)
    const enrichedPrediction = await enrichPredictionWithAnalysis(
      game,
      basePrediction,
      analysisContext
    );

    return NextResponse.json({
      prediction: enrichedPrediction,
      game,
      factorsUsed: basePrediction.factors.length,
      enhanced: useEnhanced,
    });
  } catch (error) {
    console.error('Error analyzing game:', error);
    return NextResponse.json(
      { error: 'Failed to analyze game' },
      { status: 500 }
    );
  }
}

/**
 * Build analysis context from game data for LLM
 */
function buildAnalysisContext(
  homeRecentGames: RecentGame[],
  awayRecentGames: RecentGame[],
  homeLastGameDate: Date | undefined,
  awayLastGameDate: Date | undefined,
  gameStartTime: Date,
  factors: PredictionFactor[]
): GameAnalysisContext {
  return {
    homeStreak: getStreakInfo(homeRecentGames),
    awayStreak: getStreakInfo(awayRecentGames),
    homeRestDays: calculateRestDays(homeLastGameDate, gameStartTime),
    awayRestDays: calculateRestDays(awayLastGameDate, gameStartTime),
    homeLast5: getLast5Record(homeRecentGames),
    awayLast5: getLast5Record(awayRecentGames),
    homeAvgScore: getAvgScore(homeRecentGames),
    awayAvgScore: getAvgScore(awayRecentGames),
    factors,
  };
}

/**
 * Extract streak info from recent games
 */
function getStreakInfo(
  games: RecentGame[]
): { type: 'win' | 'loss'; count: number } | undefined {
  if (games.length === 0) return undefined;

  // Sort by date descending
  const sorted = [...games].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const firstResult = sorted[0].result;
  if (firstResult === 'draw') return undefined;

  let count = 0;
  for (const game of sorted) {
    if (game.result === firstResult) {
      count++;
    } else {
      break;
    }
  }

  return { type: firstResult, count };
}

/**
 * Calculate rest days between last game and upcoming game
 */
function calculateRestDays(
  lastGameDate: Date | undefined,
  gameStartTime: Date
): number | undefined {
  if (!lastGameDate) return undefined;

  const lastGame = new Date(lastGameDate);
  const gameDay = new Date(gameStartTime);

  const diffMs = gameDay.getTime() - lastGame.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays - 1); // Subtract 1 because game day itself doesn't count as rest
}

/**
 * Get last 5 games record
 */
function getLast5Record(
  games: RecentGame[]
): { wins: number; losses: number } | undefined {
  if (games.length === 0) return undefined;

  // Sort by date descending and take last 5
  const sorted = [...games]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const wins = sorted.filter((g) => g.result === 'win').length;
  const losses = sorted.filter((g) => g.result === 'loss').length;

  return { wins, losses };
}

/**
 * Get average score from recent games
 */
function getAvgScore(games: RecentGame[]): number | undefined {
  if (games.length === 0) return undefined;

  const totalScore = games.reduce((sum, g) => sum + g.teamScore, 0);
  return totalScore / games.length;
}
