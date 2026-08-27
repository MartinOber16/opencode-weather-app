import { afterEach, describe, expect, test } from "bun:test";
import { getDailyForecast, getWeather } from "../../src/api/weather";
import type { City } from "../../src/types/City";

const city: City = {
  name: "Madrid",
  latitude: 40.4165,
  longitude: -3.70256,
  country: "España",
};

let capturedUrl = "";

function mockFetchOk() {
  globalThis.fetch = (async (url: string | URL) => {
    capturedUrl = url.toString();
    return { ok: true, statusText: "OK", json: async () => ({}) } as Response;
  }) as unknown as typeof fetch;
}

function mockFetchFail() {
  globalThis.fetch = (async () => {
    return { ok: false, statusText: "Bad Gateway" } as Response;
  }) as unknown as typeof fetch;
}

afterEach(() => {
  capturedUrl = "";
  delete (globalThis as { fetch?: unknown }).fetch;
});

describe("getWeather", () => {
  test("construye URL con lat/lon y unidad celsius", async () => {
    mockFetchOk();
    await getWeather(city, "C");

    expect(capturedUrl).toContain("https://api.open-meteo.com/v1/forecast");
    expect(capturedUrl).toContain("latitude=40.4165");
    expect(capturedUrl).toContain("longitude=-3.70256");
    expect(capturedUrl).toContain("current=temperature_2m,relative_humidity_2m");
    expect(capturedUrl).toContain("temperature_unit=celsius");
  });

  test("usa fahrenheit cuando la unidad es F", async () => {
    mockFetchOk();
    await getWeather(city, "F");
    expect(capturedUrl).toContain("temperature_unit=fahrenheit");
  });

  test("devuelve la respuesta en JSON", async () => {
    const payload = {
      current: { temperature_2m: 20, weather_code: 0 },
      current_units: { temperature_2m: "°C" },
    };
    globalThis.fetch = (async () => ({
      ok: true,
      statusText: "OK",
      json: async () => payload,
    })) as unknown as typeof fetch;

    const result = await getWeather(city, "C");
    expect(result.current.temperature_2m).toBe(20);
  });

  test("lanza error si la respuesta no es exitosa", async () => {
    mockFetchFail();
    await expect(getWeather(city, "C")).rejects.toThrow(
      "Error al obtener clima: Bad Gateway"
    );
  });
});

describe("getDailyForecast", () => {
  test("construye URL con daily, timezone auto y unidad celsius", async () => {
    mockFetchOk();
    await getDailyForecast(city, "C");

    expect(capturedUrl).toContain("daily=weather_code,temperature_2m_max,temperature_2m_min");
    expect(capturedUrl).toContain("timezone=auto");
    expect(capturedUrl).toContain("temperature_unit=celsius");
  });

  test("usa fahrenheit cuando la unidad es F", async () => {
    mockFetchOk();
    await getDailyForecast(city, "F");
    expect(capturedUrl).toContain("temperature_unit=fahrenheit");
  });

  test("lanza error si la respuesta no es exitosa", async () => {
    mockFetchFail();
    await expect(getDailyForecast(city, "C")).rejects.toThrow(
      "Error al obtener pronóstico: Bad Gateway"
    );
  });
});
