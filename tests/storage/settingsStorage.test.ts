import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  loadSettings,
  saveSettings,
} from "../../src/storage/settingsStorage";
import type { Settings } from "../../src/types/City";

const DEFAULT_SETTINGS: Settings = {
  defaultCity: "",
  unit: "C",
  cities: [],
};

let fileExists = false;
let fileContent = "";
let writtenContent = "";
let writtenPath = "";
let saveCalled = false;

const originalBunFile = Bun.file;
const originalBunWrite = Bun.write;

function installMocks() {
  const fakeFile = {
    exists: () => Promise.resolve(fileExists),
    text: () => Promise.resolve(fileContent),
  };
  (Bun as Record<string, unknown>).file = (() => fakeFile) as unknown as typeof Bun.file;
  (Bun as Record<string, unknown>).write = ((path: string | URL, data: string) => {
    writtenPath = path.toString();
    writtenContent = data;
    saveCalled = true;
    return Promise.resolve(0);
  }) as unknown as typeof Bun.write;
}

afterEach(() => {
  fileExists = false;
  fileContent = "";
  writtenContent = "";
  writtenPath = "";
  saveCalled = false;
  (Bun as Record<string, unknown>).file = originalBunFile;
  (Bun as Record<string, unknown>).write = originalBunWrite;
  mock.restore();
});

describe("loadSettings", () => {
  test("devuelve defaults y guarda el archivo si no existe", async () => {
    installMocks();
    fileExists = false;

    const result = await loadSettings();

    expect(result).toEqual(DEFAULT_SETTINGS);
    expect(saveCalled).toBe(true);
  });

  test("parsea el contenido del archivo cuando existe", async () => {
    installMocks();
    fileExists = true;
    fileContent = JSON.stringify({
      defaultCity: "Madrid",
      unit: "F",
      cities: [{ name: "Madrid", latitude: 40, longitude: -3, country: "España" }],
    });

    const result = await loadSettings();

    expect(result.defaultCity).toBe("Madrid");
    expect(result.unit).toBe("F");
    expect(result.cities).toHaveLength(1);
    expect(saveCalled).toBe(false);
  });
});

describe("saveSettings", () => {
  test("escribe el JSON formateado en el archivo", () => {
    installMocks();
    const settings: Settings = {
      defaultCity: "Madrid",
      unit: "C",
      cities: [],
    };

    saveSettings(settings);

    expect(saveCalled).toBe(true);
    expect(writtenContent).toBe(JSON.stringify(settings, null, 2));
  });
});
