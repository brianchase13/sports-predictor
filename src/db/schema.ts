import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Teams table
export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  abbreviation: text('abbreviation').notNull(),
  sport: text('sport').notNull(), // nfl, nba, mlb, nhl, soccer
  leagueId: text('league_id').notNull(),
  eloRating: real('elo_rating').notNull().default(1500),
  logoUrl: text('logo_url'),
  city: text('city'),
  wins: integer('wins').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  draws: integer('draws').default(0),
});

// Games table
export const games = sqliteTable('games', {
  id: text('id').primaryKey(),
  sport: text('sport').notNull(),
  leagueId: text('league_id').notNull(),
  homeTeamId: text('home_team_id').notNull().references(() => teams.id),
  awayTeamId: text('away_team_id').notNull().references(() => teams.id),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull().default('scheduled'), // scheduled, live, completed, postponed
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  venue: text('venue'),
});

// Predictions table
export const predictions = sqliteTable('predictions', {
  id: text('id').primaryKey(),
  gameId: text('game_id').notNull().references(() => games.id),
  predictedWinner: text('predicted_winner').notNull(), // home, away, draw
  confidence: real('confidence').notNull(), // 0-100
  mlProbability: real('ml_probability').notNull(), // 0-1
  homeWinProbability: real('home_win_probability').notNull(),
  awayWinProbability: real('away_win_probability').notNull(),
  drawProbability: real('draw_probability'),
  llmAnalysis: text('llm_analysis'),
  factors: text('factors'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  correct: integer('correct', { mode: 'boolean' }), // null until game completes
});

// Elo history for tracking rating changes
export const eloHistory = sqliteTable('elo_history', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id),
  gameId: text('game_id').notNull().references(() => games.id),
  ratingBefore: real('rating_before').notNull(),
  ratingAfter: real('rating_after').notNull(),
  ratingChange: real('rating_change').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// Types for insert/select
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Prediction = typeof predictions.$inferSelect;
export type NewPrediction = typeof predictions.$inferInsert;
