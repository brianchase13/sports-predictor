import { NextResponse } from 'next/server';
import { Sport, Prediction, Game, SPORTS, Team } from '@/lib/types';
import { allTeams } from '@/lib/mock-data';
import { generatePrediction } from '@/lib/prediction-engine';

// Group teams by sport
function getTeamsBySport(sport: Sport): Team[] {
  return allTeams.filter(team => team.sport === sport);
}

// Cache predictions to maintain consistency across paginated requests
let cachedPredictions: (Prediction & { wasCorrect: boolean })[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

// Generate historical predictions with results
function generateHistoricalPredictions(daysBack: number = 30): (Prediction & { wasCorrect: boolean })[] {
  // Check cache
  const now = Date.now();
  if (cachedPredictions && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedPredictions;
  }

  const predictions: (Prediction & { wasCorrect: boolean })[] = [];

  const sports = Object.keys(SPORTS) as Sport[];

  for (let i = 1; i <= daysBack; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate 2-4 games per day across different sports
    const gamesPerDay = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < gamesPerDay; j++) {
      const sport = sports[Math.floor(Math.random() * sports.length)];
      const sportTeams = getTeamsBySport(sport);

      if (sportTeams.length < 2) continue;

      // Pick two random teams
      const shuffled = [...sportTeams].sort(() => Math.random() - 0.5);
      const homeTeam = shuffled[0];
      const awayTeam = shuffled[1];

      const gameId = `hist-${sport}-${date.toISOString().split('T')[0]}-${j}`;

      const game: Game = {
        id: gameId,
        sport,
        leagueId: homeTeam.leagueId,
        homeTeam,
        awayTeam,
        startTime: date,
        status: 'completed',
        homeScore: Math.floor(Math.random() * 10),
        awayScore: Math.floor(Math.random() * 10),
      };

      // Adjust scores based on sport
      if (sport === 'nfl') {
        game.homeScore = Math.floor(Math.random() * 35) + 7;
        game.awayScore = Math.floor(Math.random() * 35) + 7;
      } else if (sport === 'nba') {
        game.homeScore = Math.floor(Math.random() * 40) + 90;
        game.awayScore = Math.floor(Math.random() * 40) + 90;
      } else if (sport === 'mlb') {
        game.homeScore = Math.floor(Math.random() * 8) + 1;
        game.awayScore = Math.floor(Math.random() * 8) + 1;
      } else if (sport === 'nhl') {
        game.homeScore = Math.floor(Math.random() * 5) + 1;
        game.awayScore = Math.floor(Math.random() * 5) + 1;
      } else {
        // Soccer - lower scoring
        game.homeScore = Math.floor(Math.random() * 4);
        game.awayScore = Math.floor(Math.random() * 4);
      }

      // Determine actual winner
      let actualWinner: 'home' | 'away' | 'draw';
      if (game.homeScore! > game.awayScore!) {
        actualWinner = 'home';
      } else if (game.awayScore! > game.homeScore!) {
        actualWinner = 'away';
      } else {
        actualWinner = 'draw';
      }

      // Generate prediction (will be based on Elo ratings)
      const prediction = generatePrediction(game);
      prediction.createdAt = date;

      // Simulate higher accuracy for high-confidence predictions
      // This creates realistic accuracy patterns
      let wasCorrect: boolean;
      if (prediction.confidence >= 80) {
        wasCorrect = Math.random() < 0.78; // ~78% accuracy for very high confidence
      } else if (prediction.confidence >= 70) {
        wasCorrect = Math.random() < 0.68; // ~68% accuracy for high confidence
      } else if (prediction.confidence >= 60) {
        wasCorrect = Math.random() < 0.58; // ~58% accuracy for moderate confidence
      } else {
        wasCorrect = Math.random() < 0.48; // ~48% accuracy for low confidence
      }

      // Override prediction result if it was wrong
      if (!wasCorrect) {
        // Change to a wrong prediction
        if (prediction.predictedWinner === 'home') {
          prediction.predictedWinner = 'away';
        } else {
          prediction.predictedWinner = 'home';
        }
      }

      predictions.push({
        ...prediction,
        wasCorrect,
        game: {
          ...game,
          homeScore: game.homeScore,
          awayScore: game.awayScore,
        },
      });
    }
  }

  const sorted = predictions.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Update cache
  cachedPredictions = sorted;
  cacheTimestamp = now;

  return sorted;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') as Sport | null;
  const days = parseInt(searchParams.get('days') || '90');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  let predictions = generateHistoricalPredictions(days);

  // Filter by sport
  if (sport) {
    predictions = predictions.filter(p => p.game?.sport === sport);
  }

  // Filter by date range
  if (fromDate || toDate) {
    const from = fromDate ? new Date(fromDate) : new Date(0);
    const to = toDate ? new Date(toDate) : new Date();
    predictions = predictions.filter(p => {
      const predDate = new Date(p.createdAt);
      return predDate >= from && predDate <= to;
    });
  }

  // Calculate accuracy stats (on all filtered predictions, not just paginated)
  const total = predictions.length;
  const correct = predictions.filter(p => p.wasCorrect).length;
  const accuracy = total > 0 ? (correct / total) * 100 : 0;

  // Calculate accuracy by sport
  const sportStats = Object.keys(SPORTS).map(s => {
    const sportPredictions = predictions.filter(p => p.game?.sport === s);
    const sportCorrect = sportPredictions.filter(p => p.wasCorrect).length;
    return {
      sport: s,
      total: sportPredictions.length,
      correct: sportCorrect,
      accuracy: sportPredictions.length > 0
        ? (sportCorrect / sportPredictions.length) * 100
        : 0,
    };
  }).filter(s => s.total > 0);

  // Calculate accuracy by confidence tier
  const confidenceTiers = [
    { name: 'Very High (80%+)', min: 80, max: 100 },
    { name: 'High (70-79%)', min: 70, max: 79 },
    { name: 'Moderate (60-69%)', min: 60, max: 69 },
    { name: 'Low (<60%)', min: 0, max: 59 },
  ].map(tier => {
    const tierPredictions = predictions.filter(
      p => p.confidence >= tier.min && p.confidence <= tier.max
    );
    const tierCorrect = tierPredictions.filter(p => p.wasCorrect).length;
    return {
      ...tier,
      total: tierPredictions.length,
      correct: tierCorrect,
      accuracy: tierPredictions.length > 0
        ? (tierCorrect / tierPredictions.length) * 100
        : 0,
    };
  }).filter(t => t.total > 0);

  // Calculate daily accuracy for chart
  const dailyAccuracy: { date: string; accuracy: number; total: number }[] = [];
  const predictionsByDate = new Map<string, (Prediction & { wasCorrect: boolean })[]>();

  predictions.forEach(p => {
    const date = p.createdAt.toISOString().split('T')[0];
    if (!predictionsByDate.has(date)) {
      predictionsByDate.set(date, []);
    }
    predictionsByDate.get(date)!.push(p);
  });

  predictionsByDate.forEach((dayPredictions, date) => {
    const dayCorrect = dayPredictions.filter(p => p.wasCorrect).length;
    dailyAccuracy.push({
      date,
      accuracy: (dayCorrect / dayPredictions.length) * 100,
      total: dayPredictions.length,
    });
  });

  dailyAccuracy.sort((a, b) => a.date.localeCompare(b.date));

  // Paginate predictions
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPredictions = predictions.slice(startIndex, endIndex);
  const hasMore = endIndex < predictions.length;
  const totalPages = Math.ceil(predictions.length / limit);

  return NextResponse.json({
    predictions: paginatedPredictions,
    pagination: {
      page,
      limit,
      total: predictions.length,
      totalPages,
      hasMore,
    },
    stats: {
      total,
      correct,
      accuracy,
    },
    sportStats,
    confidenceTiers,
    dailyAccuracy,
  });
}
