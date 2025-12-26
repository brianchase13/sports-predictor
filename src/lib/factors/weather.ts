import { Sport } from '../types';
import { FactorResult } from './types';
import { WeatherConditions, getWeatherDescription } from '../data-sources/weather';

/**
 * Weather impact thresholds by sport
 */
const WEATHER_THRESHOLDS = {
  nfl: {
    coldTemp: 32, // Affects kicking, ball handling
    hotTemp: 90, // Heat exhaustion risk
    highWind: 15, // Affects passing
    extremeWind: 25, // Major passing impact
    precipitation: 0.1, // Any rain affects grip
  },
  mlb: {
    coldTemp: 50, // Ball doesn't travel as far
    hotTemp: 95,
    highWind: 12, // Affects fly balls
    extremeWind: 20,
    precipitation: 0.05, // Light rain can affect grip
  },
  soccer: {
    coldTemp: 40,
    hotTemp: 85,
    highWind: 20, // Ball control affected
    extremeWind: 30,
    precipitation: 0.2, // Field gets slippery
  },
  nba: { coldTemp: 0, hotTemp: 100, highWind: 100, extremeWind: 100, precipitation: 100 },
  nhl: { coldTemp: 0, hotTemp: 100, highWind: 100, extremeWind: 100, precipitation: 100 },
};

/**
 * Calculate how weather affects the game prediction
 * Returns a factor that could swing the game toward home or away team
 */
export function calculateWeatherFactor(
  weather: WeatherConditions | null | undefined,
  sport: Sport
): FactorResult {
  const weight = getWeatherWeight(sport);

  // No weather data or indoor game
  if (!weather) {
    return {
      name: 'Weather',
      value: 0,
      normalizedScore: 0,
      weight,
      description: 'No weather data available',
      confidence: 0,
    };
  }

  if (weather.isIndoor) {
    return {
      name: 'Weather',
      value: 0,
      normalizedScore: 0,
      weight: 0, // No impact for indoor games
      description: 'Indoor venue - weather not a factor',
      confidence: 1,
    };
  }

  const thresholds = WEATHER_THRESHOLDS[sport];
  const impacts: WeatherImpact[] = [];
  let totalImpact = 0;

  // Temperature impact
  if (weather.temperature <= thresholds.coldTemp) {
    const severity = (thresholds.coldTemp - weather.temperature) / 20;
    const impact = Math.min(0.5, severity * 0.3);
    totalImpact += impact;
    impacts.push({
      type: 'cold',
      severity: impact,
      description: `Cold weather (${Math.round(weather.temperature)}°F) may affect play`,
    });
  } else if (weather.temperature >= thresholds.hotTemp) {
    const severity = (weather.temperature - thresholds.hotTemp) / 15;
    const impact = Math.min(0.3, severity * 0.2);
    totalImpact += impact;
    impacts.push({
      type: 'heat',
      severity: impact,
      description: `Hot weather (${Math.round(weather.temperature)}°F) could impact stamina`,
    });
  }

  // Wind impact
  if (weather.windSpeed >= thresholds.extremeWind) {
    const impact = 0.5;
    totalImpact += impact;
    impacts.push({
      type: 'wind',
      severity: impact,
      description: `Extreme wind (${Math.round(weather.windSpeed)} mph) will significantly affect ${sport === 'nfl' ? 'passing/kicking' : sport === 'mlb' ? 'fly balls' : 'ball control'}`,
    });
  } else if (weather.windSpeed >= thresholds.highWind) {
    const severity = (weather.windSpeed - thresholds.highWind) / (thresholds.extremeWind - thresholds.highWind);
    const impact = 0.2 + severity * 0.2;
    totalImpact += impact;
    impacts.push({
      type: 'wind',
      severity: impact,
      description: `Windy conditions (${Math.round(weather.windSpeed)} mph) may affect ${sport === 'nfl' ? 'passing' : sport === 'mlb' ? 'fly balls' : 'play'}`,
    });
  }

  // Precipitation impact
  if (weather.precipitation >= thresholds.precipitation || weather.precipitationProbability >= 50) {
    const impact = getConditionImpact(weather.condition, sport);
    totalImpact += impact;
    impacts.push({
      type: 'precipitation',
      severity: impact,
      description: getPrecipitationDescription(weather, sport),
    });
  }

  // Calculate normalized score
  // Weather generally adds uncertainty rather than favoring one team
  // Exception: Home teams may be more acclimated to local conditions
  // Positive = slight home advantage in bad weather (familiarity)
  const normalizedScore = totalImpact > 0.2 ? 0.1 : 0; // Slight home boost in bad weather

  // Generate description
  const description = generateWeatherDescription(weather, impacts);

  return {
    name: 'Weather',
    value: totalImpact * 100,
    normalizedScore,
    weight: impacts.length > 0 ? weight : 0, // No weight if no impact
    description,
    confidence: 0.8, // Weather forecasts are reasonably reliable
  };
}

interface WeatherImpact {
  type: 'cold' | 'heat' | 'wind' | 'precipitation';
  severity: number;
  description: string;
}

/**
 * Get weather weight by sport
 */
function getWeatherWeight(sport: Sport): number {
  const weights: Record<Sport, number> = {
    nfl: 0.08, // Can significantly affect passing/kicking
    mlb: 0.06, // Affects fly balls, pitcher grip
    soccer: 0.05, // Field conditions matter
    nba: 0, // Indoor
    nhl: 0, // Indoor
  };
  return weights[sport];
}

/**
 * Get impact severity for weather condition
 */
function getConditionImpact(condition: string, sport: Sport): number {
  const impacts: Record<string, Record<Sport, number>> = {
    heavy_rain: { nfl: 0.4, mlb: 0.5, soccer: 0.3, nba: 0, nhl: 0 },
    rain: { nfl: 0.25, mlb: 0.35, soccer: 0.2, nba: 0, nhl: 0 },
    snow: { nfl: 0.5, mlb: 0.6, soccer: 0.4, nba: 0, nhl: 0 },
    sleet: { nfl: 0.45, mlb: 0.55, soccer: 0.35, nba: 0, nhl: 0 },
    fog: { nfl: 0.15, mlb: 0.1, soccer: 0.1, nba: 0, nhl: 0 },
    clear: { nfl: 0, mlb: 0, soccer: 0, nba: 0, nhl: 0 },
    partly_cloudy: { nfl: 0, mlb: 0, soccer: 0, nba: 0, nhl: 0 },
    cloudy: { nfl: 0, mlb: 0, soccer: 0, nba: 0, nhl: 0 },
    windy: { nfl: 0.2, mlb: 0.15, soccer: 0.1, nba: 0, nhl: 0 },
  };

  return impacts[condition]?.[sport] ?? 0;
}

/**
 * Get precipitation description
 */
function getPrecipitationDescription(
  weather: WeatherConditions,
  sport: Sport
): string {
  switch (weather.condition) {
    case 'snow':
      return `Snow expected - major impact on ${sport === 'nfl' ? 'footing and ball handling' : 'field conditions'}`;
    case 'heavy_rain':
      return `Heavy rain - ${sport === 'nfl' ? 'passing and kicking affected' : sport === 'mlb' ? 'game may be delayed' : 'slippery field conditions'}`;
    case 'rain':
      return `Rain expected (${weather.precipitationProbability}% chance) - ${sport === 'nfl' ? 'may favor run game' : 'wet conditions'}`;
    case 'sleet':
      return 'Sleet/freezing rain - hazardous playing conditions';
    default:
      return `${weather.precipitationProbability}% precipitation chance`;
  }
}

/**
 * Generate overall weather description
 */
function generateWeatherDescription(
  weather: WeatherConditions,
  impacts: WeatherImpact[]
): string {
  if (impacts.length === 0) {
    return `Good conditions: ${getWeatherDescription(weather)}`;
  }

  if (impacts.length === 1) {
    return impacts[0].description;
  }

  // Multiple weather factors
  const conditions = getWeatherDescription(weather);
  const mainImpact = impacts.sort((a, b) => b.severity - a.severity)[0];

  return `${conditions}. ${mainImpact.description}`;
}

/**
 * Get weather summary for LLM analysis
 */
export function getWeatherSummaryForLLM(weather: WeatherConditions | null | undefined): string {
  if (!weather) {
    return 'Weather data not available for this game.';
  }

  if (weather.isIndoor) {
    return 'This game is being played in a dome/indoor venue. Weather will not be a factor.';
  }

  const lines: string[] = ['Weather Conditions:'];
  lines.push(`  Temperature: ${Math.round(weather.temperature)}°F (feels like ${Math.round(weather.feelsLike)}°F)`);
  lines.push(`  Wind: ${Math.round(weather.windSpeed)} mph`);
  lines.push(`  Precipitation: ${weather.precipitationProbability}% chance`);
  lines.push(`  Conditions: ${weather.condition.replace('_', ' ')}`);

  // Add impact notes
  if (weather.windSpeed >= 15) {
    lines.push('  ⚠️ Wind may affect passing/kicking');
  }
  if (weather.temperature <= 32) {
    lines.push('  ⚠️ Cold weather may affect ball handling');
  }
  if (weather.precipitationProbability >= 50) {
    lines.push('  ⚠️ Precipitation likely - field conditions could be affected');
  }

  return lines.join('\n');
}
