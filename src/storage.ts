import type { Settings } from "./types";

const FILE_PATH = "./cities.json";

const DEFAULT_SETTINGS: Settings = {
  defaultCity: "",
  unit: "C",
  cities: [],
};

export async function loadSettings(): Promise<Settings> {
  const file = Bun.file(FILE_PATH);
  if (!(await file.exists())) {
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  const data = await file.text();
  return JSON.parse(data) as Settings;
}

export function saveSettings(settings: Settings): void {
  Bun.write(FILE_PATH, JSON.stringify(settings, null, 2));
}
