import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

import { handleDeleteCity } from "../../src/actions/removeCity";
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

beforeEach(() => {
  selectQueue = [];
  spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  mock.restore();
});

describe("handleDeleteCity", () => {
  test("retorna false si no hay ciudades", async () => {
    const settings: Settings = { ...baseSettings(), cities: [] };

    const result = await handleDeleteCity(settings);

    expect(result).toBe(false);
  });

  test("elimina la ciudad seleccionada", async () => {
    selectQueue = ["Ottawa"];
    const settings = baseSettings();

    const result = await handleDeleteCity(settings);

    expect(result).toBe(true);
    expect(settings.cities.map((c) => c.name)).toEqual(["Madrid"]);
  });

  test("reasigna defaultCity cuando se elimina la ciudad default", async () => {
    selectQueue = ["Madrid"];
    const settings = baseSettings();

    const result = await handleDeleteCity(settings);

    expect(result).toBe(true);
    expect(settings.cities.map((c) => c.name)).toEqual(["Ottawa"]);
    expect(settings.defaultCity).toBe("Ottawa");
  });

  test("deja defaultCity vacío si se elimina la única ciudad", async () => {
    selectQueue = ["Madrid"];
    const settings: Settings = { ...baseSettings(), cities: [baseSettings().cities[0]!] };

    const result = await handleDeleteCity(settings);

    expect(result).toBe(true);
    expect(settings.cities).toHaveLength(0);
    expect(settings.defaultCity).toBe("");
  });
});
