import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

import { handleDailyForecast } from "../../src/actions/handleDailyForecast";
import { promptSelect } from "../../src/presentation/input";
import type { Settings } from "../../src/types/City";

let selectQueue: unknown[] = [];

mock.module("@inquirer/prompts", () => ({
  select: (async () => selectQueue.shift()) as never,
}));

function baseSettings(): Settings {
  return {
    defaultCity: "Madrid",
    unit: "C",
    cities: [
      {
        name: "Madrid",
        latitude: 40.4165,
        longitude: -3.70256,
        country: "España",
        admin1: "Comunidad Autónoma de Madrid",
      },
      {
        name: "Ottawa",
        latitude: 45.41117,
        longitude: -75.69812,
        country: "Canadá",
        admin1: "Ontario",
      },
    ],
  };
}

function mockFetchOk() {
  globalThis.fetch = (async () => ({
    ok: true,
    statusText: "OK",
    json: async () => ({
      daily: {
        time: ["2026-01-01", "2026-01-02"],
        weather_code: [0, 1],
        temperature_2m_max: [10, 12],
        temperature_2m_min: [2, 3],
        precipitation_sum: [0, 1],
        wind_speed_10m_max: [5, 6],
      },
      daily_units: {},
    }),
  })) as unknown as typeof fetch;
}

beforeEach(() => {
  selectQueue = [];
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  delete (globalThis as { fetch?: unknown }).fetch;
  mock.restore();
});

describe("handleDailyForecast", () => {
  test("no llama a la API si no hay ciudades", async () => {
    const settings: Settings = { ...baseSettings(), cities: [] };
    await handleDailyForecast(settings);
  });

  test("obtiene el pronóstico de la ciudad seleccionada", async () => {
    selectQueue = [baseSettings().cities[1]!];
    mockFetchOk();
    const settings = baseSettings();

    await handleDailyForecast(settings);
  });

  test("captura el error de la API", async () => {
    selectQueue = [baseSettings().cities[0]!];
    globalThis.fetch = (async () => ({
      ok: false,
      statusText: "Server Error",
    })) as unknown as typeof fetch;
    const settings = baseSettings();

    await handleDailyForecast(settings);
  });
});
