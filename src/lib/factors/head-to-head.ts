import { Sport } from '../types';
import { FactorResult, RecentGame, FACTOR_WEIGHTS } from './types';

/**
 * Head-to-head history between two teams
 */
export interface HeadToHeadRecord {
  totalGames: number;
  homeTeamWins: number;
  awayTeamWins: number;
  draws: number;
  homeTeamAvgScore: number;
  awayTeamAvgScore: number;
  lastMeetings: HeadToHeadGame[];
  homeTeamName: string;
  awayTeamName: string;
}

export interface HeadToHeadGame {
  date: Date;
  homeTeamScore: number;
  awayTeamScore: number;
  winner: 'home' | 'away' | 'draw';
  wasHomeTeamHome: boolean; // Was the home team in current matchup also home in this past game
}

/**
 * Calculate head-to-head factor from historical matchups
 */
export function calculateHeadToHeadFactor(
  h2h: HeadToHeadRecord | undefined,
  sport: Sport
): FactorResult {
  const weight = FACTOR_WEIGHTS[sport].headToHead;

  // No H2H data available
  if (!h2h || h2h.totalGames === 0) {
    return {
      name: 'Head-to-Head',
      value: 0,
      normalizedScore: 0,
      weight,
      description: 'No recent head-to-head history available',
      confidence: 0,
    };
  }

  // Calculate win rate advantage
  const homeWinRate = h2h.homeTeamWins / h2h.totalGames;
  const awayWinRate = h2h.awayTeamWins / h2h.totalGames;
  const winRateDiff = homeWinRate - awayWinRate;

  // Calculate average margin
  const avgMargin = h2h.homeTeamAvgScore - h2h.awayTeamAvgScore;

  // Recent form in H2H (last 3-5 games weighted more)
  const recentBias = calculateRecentH2HBias(h2h.lastMeetings);

  // Combine factors
  // Win rate difference: -1 to +1
  // Normalize margin: divide by sport-typical margin
  const marginNorm = normalizeMargin(avgMargin, sport);

  // Combined score: 50% win rate, 30% margin, 20% recent trend
  const combinedScore =
    winRateDiff * 0.5 + marginNorm * 0.3 + recentBias * 0.2;

  // Normalize to -1 to +1 range
  const normalizedScore = Math.max(-1, Math.min(1, combinedScore));

  // Confidence based on sample size
  const confidence = calculateH2HConfidence(h2h.totalGames, sport);

  // Generate description
  const description = generateH2HDescription(h2h, normalizedScore);

  return {
    name: 'Head-to-Head',
    value: winRateDiff * 100,
    normalizedScore,
    weight,
    description,
    confidence,
  };
}

/**
 * Calculate recent H2H bias (positive = home team won more recently)
 */
function calculateRecentH2HBias(games: HeadToHeadGame[]): number {
  if (games.length === 0) return 0;

  // Weight recent games more heavily
  const weights = [1.0, 0.8, 0.6, 0.4, 0.3]; // Most recent to oldest
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < Math.min(games.length, 5); i++) {
    const game = games[i];
    const weight = weights[i];
    totalWeight += weight;

    if (game.winner === 'home') {
      weightedSum += game.wasHomeTeamHome ? weight : weight * 0.8; // Slight boost if won at their venue
    } else if (game.winner === 'away') {
      weightedSum -= game.wasHomeTeamHome ? weight * 0.8 : weight;
    }
    // Draws contribute 0
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Normalize scoring margin by sport
 */
function normalizeMargin(margin: number, sport: Sport): number {
  // Typical game margins by sport
  const typicalMargins: Record<Sport, number> = {
    nfl: 10, // NFL games average ~10 point margin
    nba: 8, // NBA ~8 points
    mlb: 2, // MLB ~2 runs
    nhl: 1.5, // NHL ~1-2 goals
    soccer: 1, // Soccer ~1 goal
  };

  const typicalMargin = typicalMargins[sport];
  return Math.max(-1, Math.min(1, margin / (typicalMargin * 2)));
}

/**
 * Calculate confidence based on sample size
 */
function calculateH2HConfidence(totalGames: number, sport: Sport): number {
  // Different sports meet different frequencies
  const idealSampleSize: Record<Sport, number> = {
    nfl: 4, // Teams meet 1-2x per year, 4 games = 2-4 years
    nba: 6, // Teams meet 2-4x per year
    mlb: 10, // Teams in same division meet 19x
    nhl: 6, // Similar to NBA
    soccer: 4, // Varies by league
  };

  const ideal = idealSampleSize[sport];

  // Confidence scales from 0.3 (1 game) to 1.0 (ideal+ games)
  if (totalGames === 0) return 0;
  if (totalGames >= ideal) return 1;

  return 0.3 + (0.7 * totalGames) / ideal;
}

/**
 * Generate human-readable H2H description
 */
function generateH2HDescription(
  h2h: HeadToHeadRecord,
  score: number
): string {
  if (h2h.totalGames === 0) {
    return 'No recent head-to-head history';
  }

  const homeWins = h2h.homeTeamWins;
  const awayWins = h2h.awayTeamWins;
  const draws = h2h.draws;
  const total = h2h.totalGames;

  if (Math.abs(score) < 0.1) {
    return `Even H2H record: ${h2h.homeTeamName} ${homeWins}-${awayWins}${draws > 0 ? `-${draws}` : ''} vs ${h2h.awayTeamName} (last ${total} meetings)`;
  }

  const dominant = score > 0 ? h2h.homeTeamName : h2h.awayTeamName;
  const dominantWins = score > 0 ? homeWins : awayWins;
  const otherWins = score > 0 ? awayWins : homeWins;

  if (Math.abs(score) > 0.5) {
    return `${dominant} dominates H2H: ${dominantWins}-${otherWins}${draws > 0 ? `-${draws}` : ''} in last ${total} meetings`;
  }

  return `${dominant} leads H2H: ${dominantWins}-${otherWins}${draws > 0 ? `-${draws}` : ''} in last ${total} meetings`;
}

/**
 * Extract head-to-head record from recent games of both teams
 * This searches through each team's recent games to find matchups against each other
 */
export function extractHeadToHeadFromRecentGames(
  homeTeamId: string,
  homeTeamName: string,
  awayTeamId: string,
  awayTeamName: string,
  homeRecentGames: RecentGame[],
  awayRecentGames: RecentGame[]
): HeadToHeadRecord {
  const h2hGames: HeadToHeadGame[] = [];

  // Find games where home team played away team
  for (const game of homeRecentGames) {
    // Check if opponent matches away team (by name similarity)
    if (isMatchingOpponent(game.opponent, awayTeamName, awayTeamId)) {
      const homeScore = game.teamScore;
      const awayScore = game.opponentScore;

      h2hGames.push({
        date: game.date,
        homeTeamScore: homeScore,
        awayTeamScore: awayScore,
        winner:
          homeScore > awayScore
            ? 'home'
            : homeScore < awayScore
              ? 'away'
              : 'draw',
        wasHomeTeamHome: game.isHome,
      });
    }
  }

  // Also check away team's games (might have different date range)
  for (const game of awayRecentGames) {
    if (isMatchingOpponent(game.opponent, homeTeamName, homeTeamId)) {
      // Flip perspective - away team's score becomes awayTeamScore
      const awayScore = game.teamScore;
      const homeScore = game.opponentScore;

      // Check if we already have this game (avoid duplicates)
      const gameDate = new Date(game.date).getTime();
      const isDuplicate = h2hGames.some(
        (g) => Math.abs(new Date(g.date).getTime() - gameDate) < 86400000 // Same day
      );

      if (!isDuplicate) {
        h2hGames.push({
          date: game.date,
          homeTeamScore: homeScore,
          awayTeamScore: awayScore,
          winner:
            homeScore > awayScore
              ? 'home'
              : homeScore < awayScore
                ? 'away'
                : 'draw',
          wasHomeTeamHome: !game.isHome, // Flip: if away team was home, home team was away
        });
      }
    }
  }

  // Sort by date descending
  h2hGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate aggregates
  const totalGames = h2hGames.length;
  const homeTeamWins = h2hGames.filter((g) => g.winner === 'home').length;
  const awayTeamWins = h2hGames.filter((g) => g.winner === 'away').length;
  const draws = h2hGames.filter((g) => g.winner === 'draw').length;

  const homeTeamTotalScore = h2hGames.reduce((sum, g) => sum + g.homeTeamScore, 0);
  const awayTeamTotalScore = h2hGames.reduce((sum, g) => sum + g.awayTeamScore, 0);

  return {
    totalGames,
    homeTeamWins,
    awayTeamWins,
    draws,
    homeTeamAvgScore: totalGames > 0 ? homeTeamTotalScore / totalGames : 0,
    awayTeamAvgScore: totalGames > 0 ? awayTeamTotalScore / totalGames : 0,
    lastMeetings: h2hGames.slice(0, 10), // Keep last 10
    homeTeamName,
    awayTeamName,
  };
}

/**
 * Check if opponent name matches team
 */
function isMatchingOpponent(
  opponentName: string,
  teamName: string,
  teamId: string
): boolean {
  const normalizedOpponent = opponentName.toLowerCase().trim();
  const normalizedTeam = teamName.toLowerCase().trim();

  // Direct match
  if (normalizedOpponent === normalizedTeam) return true;

  // Check if one contains the other (handles "Lakers" vs "Los Angeles Lakers")
  if (
    normalizedOpponent.includes(normalizedTeam) ||
    normalizedTeam.includes(normalizedOpponent)
  ) {
    return true;
  }

  // Check common abbreviations/nicknames
  const teamWords = normalizedTeam.split(' ');
  const lastWord = teamWords[teamWords.length - 1]; // Usually the nickname

  if (normalizedOpponent.includes(lastWord) && lastWord.length > 3) {
    return true;
  }

  return false;
}
