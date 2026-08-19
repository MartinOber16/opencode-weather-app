import type { City, GeocodingResponse, WeatherResponse, DailyWeatherResponse } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCities(
  name: string
): Promise<GeocodingResponse> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al buscar ciudad: ${res.statusText}`);
  }
  return res.json() as Promise<GeocodingResponse>;
}

export async function getWeather(
  city: City,
  unit: "C" | "F"
): Promise<WeatherResponse> {
  const unitParam = unit === "C" ? "celsius" : "fahrenheit";
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit=${unitParam}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al obtener clima: ${res.statusText}`);
  }
  return res.json() as Promise<WeatherResponse>;
}

export async function getDailyForecast(
  city: City,
  unit: "C" | "F"
): Promise<DailyWeatherResponse> {
  const unitParam = unit === "C" ? "celsius" : "fahrenheit";
  const url = `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&temperature_unit=${unitParam}&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al obtener pronóstico: ${res.statusText}`);
  }
  return res.json() as Promise<DailyWeatherResponse>;
}
