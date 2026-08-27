import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

import {
  handleWeatherDefault,
  handleWeatherAll,
} from "../../src/actions/getWeather";
import type { Settings } from "../../src/types/City";

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
      current: {
        temperature_2m: 20,
        relative_humidity_2m: 50,
        apparent_temperature: 19,
        precipitation: 0,
        weather_code: 0,
        wind_speed_10m: 10,
      },
      current_units: { temperature_2m: "°C" },
    }),
  })) as unknown as typeof fetch;
}

function mockFetchFail(statusText: string) {
  globalThis.fetch = (async () => ({
    ok: false,
    statusText,
  })) as unknown as typeof fetch;
}

beforeEach(() => {
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  delete (globalThis as { fetch?: unknown }).fetch;
  mock.restore();
});

describe("handleWeatherDefault", () => {
  test("no llama a la API si no hay ciudad default", async () => {
    const settings: Settings = { ...baseSettings(), defaultCity: "" };
    await handleWeatherDefault(settings);
  });

  test("obtiene y muestra el clima de la ciudad default", async () => {
    mockFetchOk();
    const settings = baseSettings();
    await handleWeatherDefault(settings);
  });

  test("captura el error de la API", async () => {
    mockFetchFail("Server Error");
    const settings = baseSettings();
    await handleWeatherDefault(settings);
  });
});

describe("handleWeatherAll", () => {
  test("no llama a la API si no hay ciudades", async () => {
    const settings: Settings = { ...baseSettings(), cities: [] };
    await handleWeatherAll(settings);
  });

  test("muestra el clima de todas las ciudades", async () => {
    mockFetchOk();
    const settings = baseSettings();
    await handleWeatherAll(settings);
  });
});
