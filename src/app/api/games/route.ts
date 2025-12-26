import { NextRequest, NextResponse } from 'next/server';
import { fetchUpcomingGames, fetchTodaysGames, checkApiStatus } from '@/lib/sports-api';
import { Sport } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') as Sport | null;
    const limit = searchParams.get('limit');
    const today = searchParams.get('today') === 'true';

    // Fetch games from ESPN API
    let games = today
      ? await fetchTodaysGames(sport || undefined)
      : await fetchUpcomingGames(sport || undefined);

    // Apply limit if specified
    if (limit) {
      games = games.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      games,
      total: games.length,
      source: 'ESPN',
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
