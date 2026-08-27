import { describe, expect, test } from "bun:test";
import {
  WEATHER_CODES,
  formatCityLabel,
  formatLocation,
} from "../../src/utils/format";
import type { City } from "../../src/types/City";

const cityConAdmin1: City = {
  name: "Madrid",
  latitude: 40.4165,
  longitude: -3.70256,
  country: "España",
  admin1: "Comunidad Autónoma de Madrid",
};

const citySinAdmin1: City = {
  name: "Buenos Aires",
  latitude: -34.61315,
  longitude: -58.37723,
  country: "Argentina",
};

describe("formatCityLabel", () => {
  test("incluye admin1 cuando existe", () => {
    expect(formatCityLabel(cityConAdmin1)).toBe(
      "Madrid, Comunidad Autónoma de Madrid, España"
    );
  });

  test("omite admin1 cuando no existe", () => {
    expect(formatCityLabel(citySinAdmin1)).toBe("Buenos Aires, Argentina");
  });
});

describe("formatLocation", () => {
  test("usa admin1 en lugar de país cuando existe", () => {
    expect(formatLocation(cityConAdmin1)).toBe(
      "Madrid, Comunidad Autónoma de Madrid"
    );
  });

  test("usa país cuando no hay admin1", () => {
    expect(formatLocation(citySinAdmin1)).toBe("Buenos Aires, Argentina");
  });
});

describe("WEATHER_CODES", () => {
  test("mapea códigos conocidos a su condición en español", () => {
    expect(WEATHER_CODES[0]).toBe("Despejado");
    expect(WEATHER_CODES[3]).toBe("Nublado");
    expect(WEATHER_CODES[61]).toBe("Lluvia leve");
    expect(WEATHER_CODES[95]).toBe("Tormenta");
  });

  test("no contiene códigos indefinidos", () => {
    for (const value of Object.values(WEATHER_CODES)) {
      expect(typeof value).toBe("string");
    }
  });
});
