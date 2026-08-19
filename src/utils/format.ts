import type { City } from "../types/City";

export const WEATHER_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Lluvia ligera",
  53: "Lluvia moderada",
  55: "Lluvia intensa",
  56: "Lluvia ligera congelante",
  57: "Lluvia intensa congelante",
  61: "Lluvia leve",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia leve congelante",
  67: "Lluvia fuerte congelante",
  71: "Nieve leve",
  73: "Nieve moderada",
  75: "Nieve fuerte",
  77: "Granizo",
  80: "Chubascos leves",
  81: "Chubascos moderados",
  82: "Chubascos fuertes",
  85: "Chubascos de nieve leves",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo leve",
  99: "Tormenta con granizo fuerte",
};

export function formatCityLabel(city: City): string {
  if (city.admin1) {
    return `${city.name}, ${city.admin1}, ${city.country}`;
  }
  return `${city.name}, ${city.country}`;
}

export function formatLocation(city: City): string {
  return city.admin1
    ? `${city.name}, ${city.admin1}`
    : `${city.name}, ${city.country}`;
}
