import { afterEach, describe, expect, test } from "bun:test";
import { searchCities } from "../../src/api/geocoding";

function mockFetch(response: unknown) {
  globalThis.fetch = (() => Promise.resolve(response)) as unknown as typeof fetch;
}

afterEach(() => {
  delete (globalThis as { fetch?: unknown }).fetch;
});

describe("searchCities", () => {
  test("construye la URL correcta con el nombre codificado", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url: string | URL) => {
      capturedUrl = url.toString();
      return {
        ok: true,
        statusText: "OK",
        json: async () => ({ results: [] }),
      } as Response;
    }) as unknown as typeof fetch;

    await searchCities("San José");

    expect(capturedUrl).toContain("https://geocoding-api.open-meteo.com/v1/search");
    expect(capturedUrl).toContain("name=San%20Jos%C3%A9");
    expect(capturedUrl).toContain("count=5");
    expect(capturedUrl).toContain("language=es");
    expect(capturedUrl).toContain("format=json");
  });

  test("devuelve los resultados cuando la respuesta es correcta", async () => {
    const payload = {
      results: [
        { id: 1, name: "Madrid", latitude: 40.4, longitude: -3.7, country: "España" },
      ],
    };
    mockFetch({ ok: true, statusText: "OK", json: async () => payload });

    const result = await searchCities("Madrid");
    expect(result.results).toHaveLength(1);
    expect(result.results![0]!.name).toBe("Madrid");
  });

  test("lanza error cuando la respuesta no es exitosa", async () => {
    mockFetch({ ok: false, statusText: "Not Found" });

    await expect(searchCities("x")).rejects.toThrow(
      "Error al buscar ciudad: Not Found"
    );
  });

  test("lanza error cuando fetch falla", async () => {
    globalThis.fetch = (() => Promise.reject(new Error("Network down"))) as unknown as typeof fetch;

    await expect(searchCities("x")).rejects.toThrow("Network down");
  });
});
