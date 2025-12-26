import { Team, Game, Sport } from './types';
import { v4 as uuid } from 'uuid';
import { addDays, addHours, setHours, setMinutes } from 'date-fns';

// NFL Teams
const nflTeams: Omit<Team, 'record'>[] = [
  { id: 'nfl-kc', name: 'Kansas City Chiefs', abbreviation: 'KC', sport: 'nfl', leagueId: 'nfl', eloRating: 1650, city: 'Kansas City' },
  { id: 'nfl-sf', name: 'San Francisco 49ers', abbreviation: 'SF', sport: 'nfl', leagueId: 'nfl', eloRating: 1620, city: 'San Francisco' },
  { id: 'nfl-phi', name: 'Philadelphia Eagles', abbreviation: 'PHI', sport: 'nfl', leagueId: 'nfl', eloRating: 1600, city: 'Philadelphia' },
  { id: 'nfl-buf', name: 'Buffalo Bills', abbreviation: 'BUF', sport: 'nfl', leagueId: 'nfl', eloRating: 1590, city: 'Buffalo' },
  { id: 'nfl-dal', name: 'Dallas Cowboys', abbreviation: 'DAL', sport: 'nfl', leagueId: 'nfl', eloRating: 1560, city: 'Dallas' },
  { id: 'nfl-det', name: 'Detroit Lions', abbreviation: 'DET', sport: 'nfl', leagueId: 'nfl', eloRating: 1580, city: 'Detroit' },
  { id: 'nfl-mia', name: 'Miami Dolphins', abbreviation: 'MIA', sport: 'nfl', leagueId: 'nfl', eloRating: 1550, city: 'Miami' },
  { id: 'nfl-bal', name: 'Baltimore Ravens', abbreviation: 'BAL', sport: 'nfl', leagueId: 'nfl', eloRating: 1610, city: 'Baltimore' },
];

// NBA Teams
const nbaTeams: Omit<Team, 'record'>[] = [
  { id: 'nba-bos', name: 'Boston Celtics', abbreviation: 'BOS', sport: 'nba', leagueId: 'nba', eloRating: 1680, city: 'Boston' },
  { id: 'nba-den', name: 'Denver Nuggets', abbreviation: 'DEN', sport: 'nba', leagueId: 'nba', eloRating: 1640, city: 'Denver' },
  { id: 'nba-okc', name: 'Oklahoma City Thunder', abbreviation: 'OKC', sport: 'nba', leagueId: 'nba', eloRating: 1620, city: 'Oklahoma City' },
  { id: 'nba-min', name: 'Minnesota Timberwolves', abbreviation: 'MIN', sport: 'nba', leagueId: 'nba', eloRating: 1600, city: 'Minneapolis' },
  { id: 'nba-lac', name: 'LA Clippers', abbreviation: 'LAC', sport: 'nba', leagueId: 'nba', eloRating: 1580, city: 'Los Angeles' },
  { id: 'nba-lal', name: 'LA Lakers', abbreviation: 'LAL', sport: 'nba', leagueId: 'nba', eloRating: 1550, city: 'Los Angeles' },
  { id: 'nba-gsw', name: 'Golden State Warriors', abbreviation: 'GSW', sport: 'nba', leagueId: 'nba', eloRating: 1560, city: 'San Francisco' },
  { id: 'nba-phx', name: 'Phoenix Suns', abbreviation: 'PHX', sport: 'nba', leagueId: 'nba', eloRating: 1570, city: 'Phoenix' },
];

// MLB Teams
const mlbTeams: Omit<Team, 'record'>[] = [
  { id: 'mlb-lad', name: 'Los Angeles Dodgers', abbreviation: 'LAD', sport: 'mlb', leagueId: 'mlb', eloRating: 1640, city: 'Los Angeles' },
  { id: 'mlb-atl', name: 'Atlanta Braves', abbreviation: 'ATL', sport: 'mlb', leagueId: 'mlb', eloRating: 1620, city: 'Atlanta' },
  { id: 'mlb-phi', name: 'Philadelphia Phillies', abbreviation: 'PHI', sport: 'mlb', leagueId: 'mlb', eloRating: 1600, city: 'Philadelphia' },
  { id: 'mlb-hou', name: 'Houston Astros', abbreviation: 'HOU', sport: 'mlb', leagueId: 'mlb', eloRating: 1590, city: 'Houston' },
  { id: 'mlb-tex', name: 'Texas Rangers', abbreviation: 'TEX', sport: 'mlb', leagueId: 'mlb', eloRating: 1580, city: 'Arlington' },
  { id: 'mlb-nyy', name: 'New York Yankees', abbreviation: 'NYY', sport: 'mlb', leagueId: 'mlb', eloRating: 1570, city: 'New York' },
];

// NHL Teams
const nhlTeams: Omit<Team, 'record'>[] = [
  { id: 'nhl-fla', name: 'Florida Panthers', abbreviation: 'FLA', sport: 'nhl', leagueId: 'nhl', eloRating: 1630, city: 'Sunrise' },
  { id: 'nhl-edm', name: 'Edmonton Oilers', abbreviation: 'EDM', sport: 'nhl', leagueId: 'nhl', eloRating: 1620, city: 'Edmonton' },
  { id: 'nhl-dal', name: 'Dallas Stars', abbreviation: 'DAL', sport: 'nhl', leagueId: 'nhl', eloRating: 1600, city: 'Dallas' },
  { id: 'nhl-van', name: 'Vancouver Canucks', abbreviation: 'VAN', sport: 'nhl', leagueId: 'nhl', eloRating: 1580, city: 'Vancouver' },
  { id: 'nhl-bos', name: 'Boston Bruins', abbreviation: 'BOS', sport: 'nhl', leagueId: 'nhl', eloRating: 1590, city: 'Boston' },
  { id: 'nhl-nyr', name: 'New York Rangers', abbreviation: 'NYR', sport: 'nhl', leagueId: 'nhl', eloRating: 1585, city: 'New York' },
];

// Soccer Teams (Premier League)
const soccerTeams: Omit<Team, 'record'>[] = [
  { id: 'epl-mci', name: 'Manchester City', abbreviation: 'MCI', sport: 'soccer', leagueId: 'epl', eloRating: 1750, city: 'Manchester' },
  { id: 'epl-ars', name: 'Arsenal', abbreviation: 'ARS', sport: 'soccer', leagueId: 'epl', eloRating: 1720, city: 'London' },
  { id: 'epl-liv', name: 'Liverpool', abbreviation: 'LIV', sport: 'soccer', leagueId: 'epl', eloRating: 1700, city: 'Liverpool' },
  { id: 'epl-avl', name: 'Aston Villa', abbreviation: 'AVL', sport: 'soccer', leagueId: 'epl', eloRating: 1620, city: 'Birmingham' },
  { id: 'epl-tot', name: 'Tottenham', abbreviation: 'TOT', sport: 'soccer', leagueId: 'epl', eloRating: 1600, city: 'London' },
  { id: 'epl-mun', name: 'Manchester United', abbreviation: 'MUN', sport: 'soccer', leagueId: 'epl', eloRating: 1580, city: 'Manchester' },
  { id: 'epl-che', name: 'Chelsea', abbreviation: 'CHE', sport: 'soccer', leagueId: 'epl', eloRating: 1570, city: 'London' },
  { id: 'epl-new', name: 'Newcastle United', abbreviation: 'NEW', sport: 'soccer', leagueId: 'epl', eloRating: 1610, city: 'Newcastle' },
];

// All teams combined
export const allTeams: Team[] = [
  ...nflTeams.map(t => ({ ...t, record: { wins: Math.floor(Math.random() * 10), losses: Math.floor(Math.random() * 6) } })),
  ...nbaTeams.map(t => ({ ...t, record: { wins: Math.floor(Math.random() * 50) + 20, losses: Math.floor(Math.random() * 30) + 10 } })),
  ...mlbTeams.map(t => ({ ...t, record: { wins: Math.floor(Math.random() * 60) + 60, losses: Math.floor(Math.random() * 40) + 50 } })),
  ...nhlTeams.map(t => ({ ...t, record: { wins: Math.floor(Math.random() * 40) + 30, losses: Math.floor(Math.random() * 30) + 20 } })),
  ...soccerTeams.map(t => ({ ...t, record: { wins: Math.floor(Math.random() * 20) + 10, losses: Math.floor(Math.random() * 10), draws: Math.floor(Math.random() * 8) } })),
];

// Generate upcoming games
function generateGames(teams: Omit<Team, 'record'>[], count: number, sport: Sport): Game[] {
  const games: Game[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const homeTeamData = shuffled[0];
    const awayTeamData = shuffled[1];

    const homeTeam = allTeams.find(t => t.id === homeTeamData.id)!;
    const awayTeam = allTeams.find(t => t.id === awayTeamData.id)!;

    // Random time in the next 7 days
    const gameDate = addDays(now, Math.floor(Math.random() * 7));
    const gameHour = sport === 'nfl' ? 13 + Math.floor(Math.random() * 8) : 18 + Math.floor(Math.random() * 4);
    const startTime = setMinutes(setHours(gameDate, gameHour), 0);

    games.push({
      id: uuid(),
      sport,
      leagueId: homeTeam.leagueId,
      homeTeam,
      awayTeam,
      startTime,
      status: 'scheduled',
      venue: `${homeTeam.city} Stadium`,
    });
  }

  return games;
}

// Generate all mock games
export const mockGames: Game[] = [
  ...generateGames(nflTeams, 4, 'nfl'),
  ...generateGames(nbaTeams, 6, 'nba'),
  ...generateGames(mlbTeams, 5, 'mlb'),
  ...generateGames(nhlTeams, 4, 'nhl'),
  ...generateGames(soccerTeams, 6, 'soccer'),
];

// Get games by sport
export function getGamesBySport(sport?: Sport): Game[] {
  if (!sport) return mockGames;
  return mockGames.filter(g => g.sport === sport);
}

// Get team by ID
export function getTeamById(id: string): Team | undefined {
  return allTeams.find(t => t.id === id);
}

// Get upcoming games (sorted by start time)
export function getUpcomingGames(limit?: number): Game[] {
  const sorted = [...mockGames]
    .filter(g => g.status === 'scheduled')
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return limit ? sorted.slice(0, limit) : sorted;
}
