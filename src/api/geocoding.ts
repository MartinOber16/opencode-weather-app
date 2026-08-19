import type { GeocodingResponse } from "../types/Weather";
import { GEOCODING_URL } from "../utils/constants";

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
