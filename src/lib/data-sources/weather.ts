import { Sport } from '../types';

/**
 * Weather conditions for a game
 */
export interface WeatherConditions {
  temperature: number; // Fahrenheit
  feelsLike: number;
  windSpeed: number; // mph
  windDirection: number; // degrees (0 = N, 90 = E, 180 = S, 270 = W)
  humidity: number; // percentage
  precipitation: number; // mm
  precipitationProbability: number; // percentage
  cloudCover: number; // percentage
  condition: WeatherType;
  isIndoor: boolean;
}

export type WeatherType =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'sleet'
  | 'fog'
  | 'windy';

/**
 * Check if a sport plays outdoors
 */
export function isOutdoorSport(sport: Sport): boolean {
  return sport === 'nfl' || sport === 'mlb' || sport === 'soccer';
  // NHL and NBA are indoor
}

/**
 * Known dome/indoor stadium team IDs
 * These teams play in climate-controlled environments
 */
const DOME_TEAMS: Record<Sport, string[]> = {
  nfl: [
    // Dome teams: Cowboys, Falcons, Cardinals, Lions, Rams, Saints, Colts, Vikings, Raiders
    'dallas-cowboys',
    'atlanta-falcons',
    'arizona-cardinals',
    'detroit-lions',
    'los-angeles-rams',
    'new-orleans-saints',
    'indianapolis-colts',
    'minnesota-vikings',
    'las-vegas-raiders',
    '6', '1', '22', '8', '14', '18', '11', '16', '13', // ESPN IDs
  ],
  mlb: [
    // Dome teams: Rays, Rangers, Astros, Diamondbacks, Blue Jays, Marlins
    'tampa-bay-rays',
    'texas-rangers',
    'houston-astros',
    'arizona-diamondbacks',
    'toronto-blue-jays',
    'miami-marlins',
  ],
  nba: [], // All indoor
  nhl: [], // All indoor
  soccer: [], // Most outdoor (retractable roofs rare)
};

/**
 * Check if a team plays in a dome/indoor stadium
 */
export function isIndoorVenue(teamId: string, sport: Sport): boolean {
  if (!isOutdoorSport(sport)) return true;

  const domeTeams = DOME_TEAMS[sport];
  return domeTeams.some(
    (id) => teamId.toLowerCase().includes(id.toLowerCase()) || id === teamId
  );
}

/**
 * Common stadium coordinates (lat, lng)
 * Used when venue coordinates aren't provided
 */
const STADIUM_COORDINATES: Record<string, [number, number]> = {
  // NFL Stadiums (outdoor only)
  'Arrowhead Stadium': [39.0489, -94.4839],
  'Highmark Stadium': [42.7738, -78.7870],
  'Lambeau Field': [44.5013, -88.0622],
  'Gillette Stadium': [42.0909, -71.2643],
  'Soldier Field': [41.8623, -87.6167],
  'FirstEnergy Stadium': [41.5061, -81.6995],
  'Heinz Field': [40.4468, -80.0158],
  'M&T Bank Stadium': [39.2780, -76.6227],
  'FedExField': [38.9076, -76.8645],
  'Lincoln Financial Field': [39.9008, -75.1675],
  'MetLife Stadium': [40.8135, -74.0745],
  'Bank of America Stadium': [35.2258, -80.8528],
  'Raymond James Stadium': [27.9759, -82.5033],
  'Hard Rock Stadium': [25.9580, -80.2389],
  'Nissan Stadium': [36.1665, -86.7713],
  'TIAA Bank Field': [30.3239, -81.6373],
  'Empower Field at Mile High': [39.7439, -105.0201],
  'Levi\'s Stadium': [37.4033, -121.9694],
  'Lumen Field': [47.5952, -122.3316],
  // MLB Stadiums
  'Fenway Park': [42.3467, -71.0972],
  'Wrigley Field': [41.9484, -87.6553],
  'Yankee Stadium': [40.8296, -73.9262],
  'Dodger Stadium': [34.0739, -118.2400],
  'Oracle Park': [37.7786, -122.3893],
  'Coors Field': [39.7559, -104.9942],
  'Petco Park': [32.7076, -117.1570],
  // Default (NYC)
  'default': [40.7128, -74.0060],
};

/**
 * Get coordinates for a venue
 */
function getVenueCoordinates(venue?: string): [number, number] {
  if (!venue) return STADIUM_COORDINATES['default'];

  // Try exact match first
  if (STADIUM_COORDINATES[venue]) {
    return STADIUM_COORDINATES[venue];
  }

  // Try partial match
  for (const [name, coords] of Object.entries(STADIUM_COORDINATES)) {
    if (venue.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(venue.toLowerCase())) {
      return coords;
    }
  }

  return STADIUM_COORDINATES['default'];
}

/**
 * Simple in-memory cache for weather data
 */
const weatherCache = new Map<string, { data: WeatherConditions; expires: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch weather for a game using Open-Meteo API (free, no API key needed)
 */
export async function fetchGameWeather(
  gameTime: Date,
  venue?: string,
  homeTeamId?: string,
  sport: Sport = 'nfl'
): Promise<WeatherConditions | null> {
  // Skip for indoor sports
  if (!isOutdoorSport(sport)) {
    return {
      temperature: 72,
      feelsLike: 72,
      windSpeed: 0,
      windDirection: 0,
      humidity: 50,
      precipitation: 0,
      precipitationProbability: 0,
      cloudCover: 0,
      condition: 'clear',
      isIndoor: true,
    };
  }

  // Check if dome team
  if (homeTeamId && isIndoorVenue(homeTeamId, sport)) {
    return {
      temperature: 72,
      feelsLike: 72,
      windSpeed: 0,
      windDirection: 0,
      humidity: 50,
      precipitation: 0,
      precipitationProbability: 0,
      cloudCover: 0,
      condition: 'clear',
      isIndoor: true,
    };
  }

  const [lat, lng] = getVenueCoordinates(venue);
  const cacheKey = `${lat}-${lng}-${gameTime.toISOString().split('T')[0]}`;

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    // Format date for API
    const dateStr = gameTime.toISOString().split('T')[0];
    const hour = gameTime.getHours();

    // Open-Meteo API - completely free, no API key needed
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,` +
      `relative_humidity_2m,precipitation,precipitation_probability,cloud_cover,weather_code` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=mm` +
      `&start_date=${dateStr}&end_date=${dateStr}`;

    const response = await fetch(url, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return null;
    }

    const data: OpenMeteoResponse = await response.json();

    // Get hourly data for game time
    const hourIndex = hour;

    const weather: WeatherConditions = {
      temperature: data.hourly.temperature_2m[hourIndex] ?? 70,
      feelsLike: data.hourly.apparent_temperature[hourIndex] ?? 70,
      windSpeed: data.hourly.wind_speed_10m[hourIndex] ?? 0,
      windDirection: data.hourly.wind_direction_10m[hourIndex] ?? 0,
      humidity: data.hourly.relative_humidity_2m[hourIndex] ?? 50,
      precipitation: data.hourly.precipitation[hourIndex] ?? 0,
      precipitationProbability: data.hourly.precipitation_probability[hourIndex] ?? 0,
      cloudCover: data.hourly.cloud_cover[hourIndex] ?? 0,
      condition: mapWeatherCode(data.hourly.weather_code[hourIndex]),
      isIndoor: false,
    };

    // Cache the result
    weatherCache.set(cacheKey, {
      data: weather,
      expires: Date.now() + CACHE_TTL,
    });

    return weather;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Map Open-Meteo weather codes to our weather types
 * https://open-meteo.com/en/docs
 */
function mapWeatherCode(code: number): WeatherType {
  if (code === 0) return 'clear';
  if (code >= 1 && code <= 3) return 'partly_cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 55) return 'rain';
  if (code >= 56 && code <= 57) return 'sleet';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 66 && code <= 67) return 'sleet';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95 && code <= 99) return 'heavy_rain'; // Thunderstorm

  return 'cloudy';
}

/**
 * Get weather description for display
 */
export function getWeatherDescription(weather: WeatherConditions): string {
  if (weather.isIndoor) {
    return 'Indoor/Dome (climate controlled)';
  }

  const parts: string[] = [];

  // Temperature
  parts.push(`${Math.round(weather.temperature)}°F`);

  // Feels like if significantly different
  if (Math.abs(weather.feelsLike - weather.temperature) >= 5) {
    parts.push(`(feels like ${Math.round(weather.feelsLike)}°F)`);
  }

  // Wind
  if (weather.windSpeed >= 10) {
    const direction = getWindDirectionName(weather.windDirection);
    parts.push(`Wind: ${Math.round(weather.windSpeed)} mph ${direction}`);
  }

  // Precipitation
  if (weather.precipitationProbability >= 30) {
    parts.push(`${weather.precipitationProbability}% chance of ${weather.condition}`);
  }

  return parts.join(', ');
}

/**
 * Get wind direction name from degrees
 */
function getWindDirectionName(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Open-Meteo API response types
interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    cloud_cover: number[];
    weather_code: number[];
  };
}
