import { Game, Sport, Team } from '../types';

// Extended team data with additional context for factor calculations
export interface TeamContext {
  team: Team;
  recentGames: RecentGame[];
  lastGameDate?: Date;
  isHome: boolean;
}

// Simplified game result for recent game history
export interface RecentGame {
  date: Date;
  opponent: string;
  isHome: boolean;
  teamScore: number;
  opponentScore: number;
  result: 'win' | 'loss' | 'draw';
}

// Individual factor calculation result
export interface FactorResult {
  name: string;
  value: number; // Raw value
  normalizedScore: number; // -1 to +1 scale (positive = favors home)
  weight: number;
  description: string;
  confidence: number; // 0-1, how reliable this factor is
}

// Aggregated factors for a game
export interface GameFactors {
  game: Game;
  factors: FactorResult[];
  combinedScore: number; // Weighted average of all factors
  homeAdvantage: number; // Net home team advantage
  awayAdvantage: number; // Net away team advantage
}

// Sport-specific factor weights
export const FACTOR_WEIGHTS: Record<Sport, Record<string, number>> = {
  nfl: {
    teamStrength: 0.25,
    homeAdvantage: 0.12,
    recentForm: 0.15,
    restDays: 0.10,
    winStreak: 0.08,
    scoringTrend: 0.05,
    defensiveTrend: 0.05,
    seasonPhase: 0.05,
    headToHead: 0.05,
    bettingOdds: 0.10, // Future: when available
  },
  nba: {
    teamStrength: 0.20,
    homeAdvantage: 0.15,
    recentForm: 0.15,
    restDays: 0.12, // B2B games matter a lot in NBA
    winStreak: 0.08,
    scoringTrend: 0.05,
    defensiveTrend: 0.05,
    seasonPhase: 0.05,
    headToHead: 0.05,
    bettingOdds: 0.10,
  },
  mlb: {
    teamStrength: 0.25,
    homeAdvantage: 0.08,
    recentForm: 0.10,
    restDays: 0.05, // Less impactful in MLB
    winStreak: 0.08,
    scoringTrend: 0.07,
    defensiveTrend: 0.07,
    seasonPhase: 0.10,
    headToHead: 0.10,
    bettingOdds: 0.10,
  },
  nhl: {
    teamStrength: 0.25,
    homeAdvantage: 0.12,
    recentForm: 0.12,
    restDays: 0.10,
    winStreak: 0.08,
    scoringTrend: 0.05,
    defensiveTrend: 0.05,
    seasonPhase: 0.08,
    headToHead: 0.05,
    bettingOdds: 0.10,
  },
  soccer: {
    teamStrength: 0.20,
    homeAdvantage: 0.15,
    recentForm: 0.15,
    restDays: 0.08,
    winStreak: 0.08,
    scoringTrend: 0.05,
    defensiveTrend: 0.05,
    seasonPhase: 0.06,
    headToHead: 0.08,
    bettingOdds: 0.10,
  },
};
