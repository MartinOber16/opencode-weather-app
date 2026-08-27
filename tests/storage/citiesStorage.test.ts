import { afterEach, describe, expect, mock, test } from "bun:test";
import { loadCities } from "../../src/storage/citiesStorage";

let fileExists = false;
let fileContent = "";

const originalBunFile = Bun.file;
const originalBunWrite = Bun.write;

function installMocks() {
  const fakeFile = {
    exists: () => Promise.resolve(fileExists),
    text: () => Promise.resolve(fileContent),
  };
  (Bun as Record<string, unknown>).file = (() => fakeFile) as unknown as typeof Bun.file;
  (Bun as Record<string, unknown>).write = (() =>
    Promise.resolve(0)) as unknown as typeof Bun.write;
}

afterEach(() => {
  fileExists = false;
  fileContent = "";
  (Bun as Record<string, unknown>).file = originalBunFile;
  (Bun as Record<string, unknown>).write = originalBunWrite;
  mock.restore();
});

describe("loadCities", () => {
  test("devuelve la lista de ciudades del settings", async () => {
    installMocks();
    fileExists = true;
    fileContent = JSON.stringify({
      defaultCity: "Madrid",
      unit: "C",
      cities: [{ name: "Madrid", latitude: 40, longitude: -3, country: "España" }],
    });

    const result = await loadCities();

    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe("Madrid");
  });
});
