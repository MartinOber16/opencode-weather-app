import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";

import { handleSettings } from "../../src/actions/handleSettings";
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

describe("handleSettings", () => {
  test("cambia la unidad a Fahrenheit", async () => {
    selectQueue = ["F"];
    const settings = baseSettings();

    const result = await handleSettings(settings);

    expect(result).toBe(true);
    expect(settings.unit).toBe("F");
  });

  test("cambia la unidad a Celsius", async () => {
    selectQueue = ["C"];
    const settings: Settings = { ...baseSettings(), unit: "F" };

    const result = await handleSettings(settings);

    expect(result).toBe(true);
    expect(settings.unit).toBe("C");
  });
});
