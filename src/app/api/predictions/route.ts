import { NextRequest, NextResponse } from 'next/server';
import { fetchUpcomingGames, fetchGameContext } from '@/lib/sports-api';
import {
  generatePrediction,
  generatePredictions,
  generateEnhancedPrediction,
} from '@/lib/prediction-engine';
import { Sport, Prediction } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') as Sport | null;
    const gameId = searchParams.get('gameId');
    const enhanced = searchParams.get('enhanced') !== 'false'; // Default to true

    // Fetch real upcoming games from ESPN API
    const games = await fetchUpcomingGames(sport || undefined);

    // If specific game requested
    if (gameId) {
      const game = games.find((g) => g.id === gameId);
      if (!game) {
        return NextResponse.json(
          { error: 'Game not found' },
          { status: 404 }
        );
      }

      let prediction: Prediction;

      if (enhanced) {
        try {
          const { homeSchedule, awaySchedule } = await fetchGameContext(game);
          prediction = generateEnhancedPrediction({
            game,
            homeRecentGames: homeSchedule.recentGames,
            awayRecentGames: awaySchedule.recentGames,
            homeLastGameDate: homeSchedule.lastGameDate,
            awayLastGameDate: awaySchedule.lastGameDate,
          });
        } catch {
          prediction = generatePrediction(game);
        }
      } else {
        prediction = generatePrediction(game);
      }

      return NextResponse.json({
        prediction,
        game,
        factorsUsed: prediction.factors.length,
      });
    }

    // Generate predictions for all games
    // For batch predictions, use basic prediction to avoid too many API calls
    // Individual game analysis should use enhanced prediction
    const predictions = generatePredictions(games);

    return NextResponse.json({
      predictions,
      total: predictions.length,
      note: 'Use /api/analyze with gameId for enhanced 10+ factor predictions',
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
