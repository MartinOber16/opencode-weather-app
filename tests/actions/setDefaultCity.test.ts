import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

import { handleSetDefault } from "../../src/actions/setDefaultCity";
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

describe("handleSetDefault", () => {
  test("retorna false si no hay ciudades", async () => {
    const settings: Settings = { ...baseSettings(), cities: [] };

    const result = await handleSetDefault(settings);

    expect(result).toBe(false);
  });

  test("establece la nueva ciudad default", async () => {
    selectQueue = ["Ottawa"];
    const settings = baseSettings();

    const result = await handleSetDefault(settings);

    expect(result).toBe(true);
    expect(settings.defaultCity).toBe("Ottawa");
  });
});
