import type { City } from "../types/City";
import { loadSettings } from "./settingsStorage";

export async function loadCities(): Promise<City[]> {
  const settings = await loadSettings();
  return settings.cities;
}
