import { Sport } from '../types';

/**
 * Injury status types
 */
export type InjuryStatus =
  | 'out'           // Will not play
  | 'doubtful'      // Unlikely to play (25%)
  | 'questionable'  // Uncertain (50%)
  | 'probable'      // Likely to play (75%)
  | 'day-to-day'    // Minor issue
  | 'ir'            // Injured reserve (long-term)
  | 'unknown';

/**
 * Player injury report
 */
export interface PlayerInjury {
  playerId: string;
  playerName: string;
  position: string;
  status: InjuryStatus;
  description: string;
  returnDate?: string;
  isStarter: boolean;
  impactScore: number; // 0-1, how important this player is
}

/**
 * Team injury report
 */
export interface TeamInjuryReport {
  teamId: string;
  teamName: string;
  sport: Sport;
  injuries: PlayerInjury[];
  lastUpdated: Date;
  healthScore: number; // 0-1, 1 = fully healthy
  startersOut: number;
  keyPlayersOut: string[];
}

/**
 * Position importance by sport (0-1 scale)
 * Higher = more impactful when injured
 */
const POSITION_IMPORTANCE: Record<Sport, Record<string, number>> = {
  nfl: {
    QB: 1.0,
    LT: 0.7,
    RT: 0.6,
    RB: 0.5,
    WR: 0.5,
    TE: 0.4,
    C: 0.5,
    OG: 0.4,
    DE: 0.5,
    DT: 0.4,
    LB: 0.5,
    CB: 0.6,
    S: 0.5,
    K: 0.4,
    P: 0.2,
  },
  nba: {
    PG: 0.8,
    SG: 0.7,
    SF: 0.7,
    PF: 0.7,
    C: 0.8,
    G: 0.7,
    F: 0.7,
  },
  mlb: {
    SP: 1.0, // Starting pitcher is crucial
    RP: 0.4,
    CP: 0.6, // Closer
    C: 0.5,
    '1B': 0.4,
    '2B': 0.5,
    SS: 0.6,
    '3B': 0.5,
    LF: 0.4,
    CF: 0.5,
    RF: 0.4,
    DH: 0.4,
  },
  nhl: {
    G: 1.0, // Goalie is crucial
    C: 0.7,
    LW: 0.5,
    RW: 0.5,
    D: 0.6,
  },
  soccer: {
    GK: 1.0,
    CB: 0.6,
    LB: 0.5,
    RB: 0.5,
    CDM: 0.6,
    CM: 0.6,
    CAM: 0.7,
    LM: 0.5,
    RM: 0.5,
    LW: 0.6,
    RW: 0.6,
    ST: 0.8,
    CF: 0.8,
  },
};

/**
 * Status impact multiplier - how likely the player won't play
 */
const STATUS_IMPACT: Record<InjuryStatus, number> = {
  out: 1.0,
  ir: 1.0,
  doubtful: 0.75,
  questionable: 0.5,
  probable: 0.15,
  'day-to-day': 0.3,
  unknown: 0.5,
};

/**
 * ESPN league identifiers
 */
const ESPN_LEAGUE_MAP: Record<Sport, { sport: string; league: string }> = {
  nfl: { sport: 'football', league: 'nfl' },
  nba: { sport: 'basketball', league: 'nba' },
  mlb: { sport: 'baseball', league: 'mlb' },
  nhl: { sport: 'hockey', league: 'nhl' },
  soccer: { sport: 'soccer', league: 'usa.1' }, // MLS default
};

/**
 * Simple in-memory cache for injury data
 */
const injuryCache = new Map<string, { data: TeamInjuryReport; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetch injury report for a team from ESPN API
 */
export async function fetchTeamInjuries(
  teamId: string,
  teamName: string,
  sport: Sport
): Promise<TeamInjuryReport> {
  const cacheKey = `${sport}-${teamId}`;
  const cached = injuryCache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const { sport: espnSport, league } = ESPN_LEAGUE_MAP[sport];
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/${league}/teams/${teamId}/injuries`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
    });

    if (!response.ok) {
      // Return empty report if API fails
      return createEmptyReport(teamId, teamName, sport);
    }

    const data = await response.json();
    const report = parseInjuryResponse(data, teamId, teamName, sport);

    // Cache the result
    injuryCache.set(cacheKey, {
      data: report,
      expires: Date.now() + CACHE_TTL,
    });

    return report;
  } catch (error) {
    console.error(`Error fetching injuries for ${teamName}:`, error);
    return createEmptyReport(teamId, teamName, sport);
  }
}

/**
 * Parse ESPN injury API response
 */
function parseInjuryResponse(
  data: ESPNInjuryResponse,
  teamId: string,
  teamName: string,
  sport: Sport
): TeamInjuryReport {
  const injuries: PlayerInjury[] = [];
  const positionImportance = POSITION_IMPORTANCE[sport];

  if (data.team?.injuries) {
    for (const injury of data.team.injuries) {
      const position = normalizePosition(injury.athlete?.position?.abbreviation || '', sport);
      const baseImportance = positionImportance[position] ?? 0.4;
      const status = normalizeStatus(injury.status);

      // Boost importance for starters
      const starterMultiplier = injury.athlete?.starter ? 1.5 : 1.0;

      injuries.push({
        playerId: injury.athlete?.id || '',
        playerName: injury.athlete?.displayName || 'Unknown',
        position,
        status,
        description: injury.longComment || injury.shortComment || '',
        returnDate: injury.returnDate,
        isStarter: injury.athlete?.starter ?? false,
        impactScore: Math.min(1, baseImportance * starterMultiplier),
      });
    }
  }

  // Calculate health score
  const healthScore = calculateTeamHealthScore(injuries, sport);
  const startersOut = injuries.filter(
    (i) => i.isStarter && (i.status === 'out' || i.status === 'ir')
  ).length;
  const keyPlayersOut = injuries
    .filter((i) => i.impactScore >= 0.6 && STATUS_IMPACT[i.status] >= 0.5)
    .map((i) => `${i.playerName} (${i.position})`);

  return {
    teamId,
    teamName,
    sport,
    injuries,
    lastUpdated: new Date(),
    healthScore,
    startersOut,
    keyPlayersOut,
  };
}

/**
 * Calculate overall team health score (0-1)
 */
function calculateTeamHealthScore(injuries: PlayerInjury[], sport: Sport): number {
  if (injuries.length === 0) return 1.0;

  let totalImpact = 0;

  for (const injury of injuries) {
    const statusImpact = STATUS_IMPACT[injury.status];
    totalImpact += injury.impactScore * statusImpact;
  }

  // Normalize: assume max 5 significant injuries can fully tank a team
  const maxImpact = 3.0;
  const normalizedImpact = Math.min(1, totalImpact / maxImpact);

  return Math.max(0, 1 - normalizedImpact);
}

/**
 * Normalize position abbreviation across sports
 */
function normalizePosition(position: string, sport: Sport): string {
  const pos = position.toUpperCase().trim();

  // Common normalizations
  const normalizations: Record<string, string> = {
    // NFL
    QUARTERBACK: 'QB',
    RUNNINGBACK: 'RB',
    WIDERECEIVER: 'WR',
    TIGHTEND: 'TE',
    OFFENSIVE: 'OG',
    DEFENSIVE: 'DE',
    LINEBACKER: 'LB',
    CORNERBACK: 'CB',
    SAFETY: 'S',
    // NBA
    GUARD: 'G',
    FORWARD: 'F',
    CENTER: 'C',
    POINTGUARD: 'PG',
    SHOOTINGGUARD: 'SG',
    SMALLFORWARD: 'SF',
    POWERFORWARD: 'PF',
    // Soccer
    GOALKEEPER: 'GK',
    DEFENDER: 'CB',
    MIDFIELDER: 'CM',
    ATTACKER: 'ST',
    STRIKER: 'ST',
  };

  return normalizations[pos.replace(/\s+/g, '')] || pos;
}

/**
 * Normalize injury status
 */
function normalizeStatus(status: string): InjuryStatus {
  const s = status.toLowerCase().trim();

  if (s.includes('out') || s === 'o') return 'out';
  if (s.includes('doubtful') || s === 'd') return 'doubtful';
  if (s.includes('questionable') || s === 'q') return 'questionable';
  if (s.includes('probable') || s === 'p') return 'probable';
  if (s.includes('day-to-day') || s.includes('dtd')) return 'day-to-day';
  if (s.includes('ir') || s.includes('injured reserve') || s.includes('il')) return 'ir';

  return 'unknown';
}

/**
 * Create empty report for when API fails
 */
function createEmptyReport(teamId: string, teamName: string, sport: Sport): TeamInjuryReport {
  return {
    teamId,
    teamName,
    sport,
    injuries: [],
    lastUpdated: new Date(),
    healthScore: 1.0, // Assume healthy if no data
    startersOut: 0,
    keyPlayersOut: [],
  };
}

/**
 * Get injury reports for both teams in a game
 */
export async function getGameInjuryReports(
  homeTeamId: string,
  homeTeamName: string,
  awayTeamId: string,
  awayTeamName: string,
  sport: Sport
): Promise<{
  homeInjuries: TeamInjuryReport;
  awayInjuries: TeamInjuryReport;
}> {
  const [homeInjuries, awayInjuries] = await Promise.all([
    fetchTeamInjuries(homeTeamId, homeTeamName, sport),
    fetchTeamInjuries(awayTeamId, awayTeamName, sport),
  ]);

  return { homeInjuries, awayInjuries };
}

// ESPN API response types
interface ESPNInjuryResponse {
  team?: {
    injuries?: Array<{
      athlete?: {
        id: string;
        displayName: string;
        position?: {
          abbreviation: string;
        };
        starter?: boolean;
      };
      status: string;
      shortComment?: string;
      longComment?: string;
      returnDate?: string;
    }>;
  };
}
