import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

import { handleAddCity } from "../../src/actions/addCity";
import { promptInput, promptSelect } from "../../src/presentation/input";
import type { Settings } from "../../src/types/City";

let inputQueue: string[] = [];
let selectQueue: unknown[] = [];

mock.module("@inquirer/prompts", () => ({
  select: (async () => selectQueue.shift()) as never,
  input: (async () => inputQueue.shift()) as never,
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

function mockFetchOk(json: unknown) {
  globalThis.fetch = (async () => ({
    ok: true,
    statusText: "OK",
    json: async () => json,
  })) as unknown as typeof fetch;
}

function mockFetchFail(statusText: string) {
  globalThis.fetch = (async () => ({
    ok: false,
    statusText,
  })) as unknown as typeof fetch;
}

beforeEach(() => {
  inputQueue = [];
  selectQueue = [];
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  delete (globalThis as { fetch?: unknown }).fetch;
  mock.restore();
});

describe("handleAddCity", () => {
  test("retorna false si el texto está vacío o en blanco", async () => {
    inputQueue = ["   "];
    const settings = baseSettings();

    const result = await handleAddCity(settings);

    expect(result).toBe(false);
    expect(settings.cities).toHaveLength(2);
  });

  test("agrega una ciudad nueva y la establece como default si no había", async () => {
    inputQueue = ["Barcelona"];
    mockFetchOk({
      results: [
        { id: 2, name: "Barcelona", latitude: 41.38, longitude: 2.17, country: "España" },
      ],
    });
    selectQueue = [
      { id: 2, name: "Barcelona", latitude: 41.38, longitude: 2.17, country: "España" },
    ];
    const settings: Settings = { ...baseSettings(), defaultCity: "" };

    const result = await handleAddCity(settings);

    expect(result).toBe(true);
    expect(settings.cities).toHaveLength(3);
    expect(settings.defaultCity).toBe("Barcelona");
  });

  test("no duplica una ciudad que ya existe", async () => {
    inputQueue = ["Madrid"];
    mockFetchOk({ results: [baseSettings().cities[0]!] });
    selectQueue = [baseSettings().cities[0]!];
    const settings = baseSettings();

    const result = await handleAddCity(settings);

    expect(result).toBe(false);
    expect(settings.cities).toHaveLength(2);
  });

  test("retorna false si no hay resultados", async () => {
    inputQueue = ["Atlantis"];
    mockFetchOk({ results: [] });
    const settings = baseSettings();

    const result = await handleAddCity(settings);

    expect(result).toBe(false);
  });

  test("retorna false y captura error de la API", async () => {
    inputQueue = ["Madrid"];
    mockFetchFail("Server Error");
    const settings = baseSettings();

    const result = await handleAddCity(settings);

    expect(result).toBe(false);
  });
});
