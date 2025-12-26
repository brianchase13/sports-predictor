import { Game, Team, Sport } from './types';
import { RecentGame } from './factors/types';

// ESPN API endpoints (unofficial but reliable, no auth required)
const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

// Cache for team schedules to reduce API calls
const teamScheduleCache: Map<string, { data: TeamSchedule; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface TeamSchedule {
  teamId: string;
  teamName: string;
  recentGames: RecentGame[];
  lastGameDate?: Date;
  upcomingGames: Date[];
}

export interface GameOdds {
  homeMoneyline?: number;
  awayMoneyline?: number;
  spread?: number; // Positive = home favored
  overUnder?: number;
  impliedHomeProbability?: number;
  impliedAwayProbability?: number;
}

// Sport paths for ESPN API
const ESPN_SPORT_PATHS: Record<Sport, string> = {
  nfl: 'football/nfl',
  nba: 'basketball/nba',
  mlb: 'baseball/mlb',
  nhl: 'hockey/nhl',
  soccer: 'soccer/eng.1', // Premier League
};

// Additional soccer leagues
const SOCCER_LEAGUES = [
  { path: 'soccer/eng.1', name: 'Premier League' },
  { path: 'soccer/esp.1', name: 'La Liga' },
  { path: 'soccer/ger.1', name: 'Bundesliga' },
  { path: 'soccer/ita.1', name: 'Serie A' },
  { path: 'soccer/fra.1', name: 'Ligue 1' },
  { path: 'soccer/usa.1', name: 'MLS' },
  { path: 'soccer/uefa.champions', name: 'Champions League' },
];

interface ESPNCompetitor {
  id: string;
  team: {
    id: string;
    name: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    location: string;
    logo?: string;
  };
  homeAway: 'home' | 'away';
  score?: string;
  records?: Array<{ summary: string }>;
}

interface ESPNEvent {
  id: string;
  name: string;
  date: string;
  status: {
    type: {
      name: string;
      state: string;
      completed: boolean;
    };
  };
  competitions: Array<{
    id: string;
    venue?: {
      fullName: string;
      city: string;
    };
    competitors: ESPNCompetitor[];
    odds?: Array<{
      details: string;
      overUnder: number;
    }>;
  }>;
}

interface ESPNResponse {
  events: ESPNEvent[];
  leagues?: Array<{
    name: string;
    abbreviation: string;
  }>;
}

// Parse win-loss record from ESPN format (e.g., "10-5" or "10-5-2")
function parseRecord(recordStr?: string): { wins: number; losses: number; draws?: number } | undefined {
  if (!recordStr) return undefined;
  const parts = recordStr.split('-').map(Number);
  if (parts.length >= 2) {
    return {
      wins: parts[0] || 0,
      losses: parts[1] || 0,
      draws: parts.length > 2 ? parts[2] : undefined,
    };
  }
  return undefined;
}

// Convert ESPN event to our Game type
function convertESPNEvent(event: ESPNEvent, sport: Sport, league: string): Game | null {
  const competition = event.competitions[0];
  if (!competition || competition.competitors.length < 2) return null;

  const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
  const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

  if (!homeCompetitor || !awayCompetitor) return null;

  const homeTeam: Team = {
    id: `${sport}-${homeCompetitor.team.abbreviation.toLowerCase()}`,
    name: homeCompetitor.team.displayName || homeCompetitor.team.name,
    abbreviation: homeCompetitor.team.abbreviation,
    sport,
    leagueId: league,
    eloRating: 1500, // Base rating, will be adjusted
    city: homeCompetitor.team.location,
    logoUrl: homeCompetitor.team.logo,
    record: parseRecord(homeCompetitor.records?.[0]?.summary),
  };

  const awayTeam: Team = {
    id: `${sport}-${awayCompetitor.team.abbreviation.toLowerCase()}`,
    name: awayCompetitor.team.displayName || awayCompetitor.team.name,
    abbreviation: awayCompetitor.team.abbreviation,
    sport,
    leagueId: league,
    eloRating: 1500,
    city: awayCompetitor.team.location,
    logoUrl: awayCompetitor.team.logo,
    record: parseRecord(awayCompetitor.records?.[0]?.summary),
  };

  // Determine game status
  let status: 'scheduled' | 'live' | 'completed' = 'scheduled';
  if (event.status.type.completed) {
    status = 'completed';
  } else if (event.status.type.state === 'in') {
    status = 'live';
  }

  return {
    id: event.id,
    sport,
    leagueId: league,
    homeTeam,
    awayTeam,
    startTime: new Date(event.date),
    status,
    venue: competition.venue?.fullName,
    homeScore: homeCompetitor.score ? parseInt(homeCompetitor.score) : undefined,
    awayScore: awayCompetitor.score ? parseInt(awayCompetitor.score) : undefined,
  };
}

// Fetch games from ESPN for a specific sport
async function fetchESPNGames(sportPath: string, sport: Sport, league: string): Promise<Game[]> {
  try {
    // Get scoreboard (includes today and upcoming games)
    const url = `${ESPN_API_BASE}/${sportPath}/scoreboard`;

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SportsPredictor/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`ESPN API error for ${sportPath}:`, response.status);
      return [];
    }

    const data: ESPNResponse = await response.json();
    const games: Game[] = [];

    for (const event of data.events || []) {
      const game = convertESPNEvent(event, sport, league);
      if (game) {
        games.push(game);
      }
    }

    return games;
  } catch (error) {
    console.error(`Error fetching ${sportPath}:`, error);
    return [];
  }
}

// Fetch upcoming schedule (next 7 days) from ESPN
async function fetchESPNSchedule(sportPath: string, sport: Sport, league: string): Promise<Game[]> {
  const games: Game[] = [];
  const now = new Date();

  // Fetch next 7 days of games
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    try {
      const url = `${ESPN_API_BASE}/${sportPath}/scoreboard?dates=${dateStr}`;

      const response = await fetch(url, {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SportsPredictor/1.0)',
        },
      });

      if (!response.ok) continue;

      const data: ESPNResponse = await response.json();

      for (const event of data.events || []) {
        const game = convertESPNEvent(event, sport, league);
        if (game && game.status !== 'completed') {
          // Avoid duplicates
          if (!games.find(g => g.id === game.id)) {
            games.push(game);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching schedule for ${dateStr}:`, error);
    }
  }

  return games;
}

// Main function to fetch upcoming games
export async function fetchUpcomingGames(sport?: Sport): Promise<Game[]> {
  const allGames: Game[] = [];

  if (sport) {
    // Fetch specific sport
    if (sport === 'soccer') {
      // Fetch multiple soccer leagues
      const soccerPromises = SOCCER_LEAGUES.slice(0, 3).map(league =>
        fetchESPNSchedule(league.path, 'soccer', league.name)
      );
      const soccerResults = await Promise.all(soccerPromises);
      allGames.push(...soccerResults.flat());
    } else {
      const sportPath = ESPN_SPORT_PATHS[sport];
      const games = await fetchESPNSchedule(sportPath, sport, sport.toUpperCase());
      allGames.push(...games);
    }
  } else {
    // Fetch all sports in parallel
    const fetchPromises: Promise<Game[]>[] = [];

    // US Sports
    for (const [sportKey, path] of Object.entries(ESPN_SPORT_PATHS)) {
      if (sportKey !== 'soccer') {
        fetchPromises.push(
          fetchESPNSchedule(path, sportKey as Sport, sportKey.toUpperCase())
        );
      }
    }

    // Soccer leagues (top 3)
    for (const league of SOCCER_LEAGUES.slice(0, 3)) {
      fetchPromises.push(
        fetchESPNSchedule(league.path, 'soccer', league.name)
      );
    }

    const results = await Promise.all(fetchPromises);
    allGames.push(...results.flat());
  }

  // Sort by start time
  allGames.sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Filter to only scheduled/live games
  return allGames.filter(g => g.status !== 'completed');
}

// Get today's games (for quick display)
export async function fetchTodaysGames(sport?: Sport): Promise<Game[]> {
  const allGames: Game[] = [];

  if (sport) {
    if (sport === 'soccer') {
      for (const league of SOCCER_LEAGUES.slice(0, 3)) {
        const games = await fetchESPNGames(league.path, 'soccer', league.name);
        allGames.push(...games);
      }
    } else {
      const sportPath = ESPN_SPORT_PATHS[sport];
      const games = await fetchESPNGames(sportPath, sport, sport.toUpperCase());
      allGames.push(...games);
    }
  } else {
    const fetchPromises: Promise<Game[]>[] = [];

    for (const [sportKey, path] of Object.entries(ESPN_SPORT_PATHS)) {
      if (sportKey !== 'soccer') {
        fetchPromises.push(fetchESPNGames(path, sportKey as Sport, sportKey.toUpperCase()));
      }
    }

    for (const league of SOCCER_LEAGUES.slice(0, 3)) {
      fetchPromises.push(fetchESPNGames(league.path, 'soccer', league.name));
    }

    const results = await Promise.all(fetchPromises);
    allGames.push(...results.flat());
  }

  allGames.sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return allGames;
}

// Check if API is working
export async function checkApiStatus(): Promise<{ working: boolean; sports: string[] }> {
  const workingSports: string[] = [];

  for (const [sport, path] of Object.entries(ESPN_SPORT_PATHS)) {
    try {
      const response = await fetch(`${ESPN_API_BASE}/${path}/scoreboard`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SportsPredictor/1.0)' },
      });
      if (response.ok) {
        workingSports.push(sport);
      }
    } catch {
      // Sport endpoint not working
    }
  }

  return {
    working: workingSports.length > 0,
    sports: workingSports,
  };
}

/**
 * Fetch team's recent schedule from ESPN
 * Returns last N completed games and upcoming games
 */
export async function fetchTeamSchedule(
  teamAbbreviation: string,
  sport: Sport,
  daysBack: number = 30
): Promise<TeamSchedule> {
  const cacheKey = `${sport}-${teamAbbreviation}`;
  const cached = teamScheduleCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const recentGames: RecentGame[] = [];
  const upcomingGames: Date[] = [];
  let lastGameDate: Date | undefined;

  const sportPath = sport === 'soccer' ? ESPN_SPORT_PATHS.soccer : ESPN_SPORT_PATHS[sport];

  // Fetch past games (last 30 days)
  const now = new Date();
  for (let i = 1; i <= Math.min(daysBack, 14); i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');

    try {
      const url = `${ESPN_API_BASE}/${sportPath}/scoreboard?dates=${dateStr}`;
      const response = await fetch(url, {
        next: { revalidate: 600 }, // Cache for 10 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SportsPredictor/1.0)',
        },
      });

      if (!response.ok) continue;

      const data: ESPNResponse = await response.json();

      for (const event of data.events || []) {
        if (!event.status.type.completed) continue;

        const competition = event.competitions[0];
        if (!competition) continue;

        // Find if this team played in this game
        const homeComp = competition.competitors.find(c => c.homeAway === 'home');
        const awayComp = competition.competitors.find(c => c.homeAway === 'away');

        if (!homeComp || !awayComp) continue;

        const isHome = homeComp.team.abbreviation.toLowerCase() === teamAbbreviation.toLowerCase();
        const isAway = awayComp.team.abbreviation.toLowerCase() === teamAbbreviation.toLowerCase();

        if (!isHome && !isAway) continue;

        const teamScore = isHome
          ? parseInt(homeComp.score || '0')
          : parseInt(awayComp.score || '0');
        const opponentScore = isHome
          ? parseInt(awayComp.score || '0')
          : parseInt(homeComp.score || '0');

        let result: 'win' | 'loss' | 'draw';
        if (teamScore > opponentScore) result = 'win';
        else if (teamScore < opponentScore) result = 'loss';
        else result = 'draw';

        const gameDate = new Date(event.date);

        recentGames.push({
          date: gameDate,
          opponent: isHome ? awayComp.team.displayName : homeComp.team.displayName,
          isHome,
          teamScore,
          opponentScore,
          result,
        });

        if (!lastGameDate || gameDate > lastGameDate) {
          lastGameDate = gameDate;
        }
      }
    } catch (error) {
      console.error(`Error fetching schedule for ${dateStr}:`, error);
    }
  }

  // Sort by date (most recent first)
  recentGames.sort((a, b) => b.date.getTime() - a.date.getTime());

  const schedule: TeamSchedule = {
    teamId: `${sport}-${teamAbbreviation.toLowerCase()}`,
    teamName: teamAbbreviation,
    recentGames: recentGames.slice(0, 10), // Last 10 games
    lastGameDate,
    upcomingGames,
  };

  // Cache the result
  teamScheduleCache.set(cacheKey, { data: schedule, timestamp: Date.now() });

  return schedule;
}

/**
 * Extract odds from ESPN game data
 */
export function extractOdds(event: ESPNEvent): GameOdds | undefined {
  const competition = event.competitions[0];
  if (!competition?.odds?.[0]) return undefined;

  const oddsData = competition.odds[0];
  const odds: GameOdds = {
    overUnder: oddsData.overUnder,
  };

  // Parse spread from details (e.g., "LAL -5.5")
  if (oddsData.details) {
    const spreadMatch = oddsData.details.match(/([A-Z]+)\s*([+-]?\d+\.?\d*)/);
    if (spreadMatch) {
      const spread = parseFloat(spreadMatch[2]);
      // Note: spread is typically shown for the favored team
      odds.spread = spread;
    }
  }

  // Convert spread to implied probability (rough estimate)
  if (odds.spread !== undefined) {
    // Each point of spread is roughly 3% probability
    const spreadPct = Math.abs(odds.spread) * 0.03;
    if (odds.spread < 0) {
      // Home team favored
      odds.impliedHomeProbability = 0.5 + spreadPct;
      odds.impliedAwayProbability = 0.5 - spreadPct;
    } else {
      // Away team favored
      odds.impliedHomeProbability = 0.5 - spreadPct;
      odds.impliedAwayProbability = 0.5 + spreadPct;
    }
  }

  return odds;
}

/**
 * Fetch game with odds included
 */
export interface GameWithOdds extends Game {
  odds?: GameOdds;
}

export async function fetchGamesWithOdds(sport?: Sport): Promise<GameWithOdds[]> {
  const games = await fetchTodaysGames(sport);

  // Note: ESPN odds are already in the scoreboard response
  // We just need to extract them when converting events
  // For now, return games as-is since odds extraction happens at convert time
  return games as GameWithOdds[];
}

/**
 * Batch fetch team schedules for a game
 */
export async function fetchGameContext(game: Game): Promise<{
  homeSchedule: TeamSchedule;
  awaySchedule: TeamSchedule;
}> {
  const [homeSchedule, awaySchedule] = await Promise.all([
    fetchTeamSchedule(game.homeTeam.abbreviation, game.sport),
    fetchTeamSchedule(game.awayTeam.abbreviation, game.sport),
  ]);

  return { homeSchedule, awaySchedule };
}
