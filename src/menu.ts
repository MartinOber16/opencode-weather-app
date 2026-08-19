import { select, input, confirm } from "@inquirer/prompts";
import type { City, Settings, GeocodingResult, WeatherResponse } from "./types";
import { loadSettings, saveSettings } from "./storage";
import { searchCities, getWeather } from "./api";

const WEATHER_CODES: Record<number, string> = {
  0: "Despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Lluvia ligera",
  53: "Lluvia moderada",
  55: "Lluvia intensa",
  56: "Lluvia ligera congelante",
  57: "Lluvia intensa congelante",
  61: "Lluvia leve",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  66: "Lluvia leve congelante",
  67: "Lluvia fuerte congelante",
  71: "Nieve leve",
  73: "Nieve moderada",
  75: "Nieve fuerte",
  77: "Granizo",
  80: "Chubascos leves",
  81: "Chubascos moderados",
  82: "Chubascos fuertes",
  85: "Chubascos de nieve leves",
  86: "Chubascos de nieve fuertes",
  95: "Tormenta",
  96: "Tormenta con granizo leve",
  99: "Tormenta con granizo fuerte",
};

function displayWeather(city: City, data: WeatherResponse, unit: "C" | "F") {
  const unitSymbol = unit === "C" ? "°C" : "°F";
  const condition = WEATHER_CODES[data.current.weather_code] || "Desconocido";
  const location = city.admin1
    ? `${city.name}, ${city.admin1}`
    : `${city.name}, ${city.country}`;

  console.log("\n════════════════════════════════════════");
  console.log(`  ${location}`);
  console.log("════════════════════════════════════════");
  console.log(`  Temperatura:     ${data.current.temperature_2m}${unitSymbol}`);
  console.log(`  Sensación:       ${data.current.apparent_temperature}${unitSymbol}`);
  console.log(`  Humedad:         ${data.current.relative_humidity_2m}%`);
  console.log(`  Viento:          ${data.current.wind_speed_10m} km/h`);
  console.log(`  Condición:       ${condition}`);
  console.log("════════════════════════════════════════\n");
}

function formatCityLabel(city: City): string {
  if (city.admin1) {
    return `${city.name}, ${city.admin1}, ${city.country}`;
  }
  return `${city.name}, ${city.country}`;
}

async function handleWeatherDefault(settings: Settings) {
  const city = settings.cities.find(
    (c) => c.name === settings.defaultCity
  );
  if (!city) {
    console.log("\n  No hay ciudad default configurada.\n");
    return;
  }
  try {
    const data = await getWeather(city, settings.unit);
    displayWeather(city, data, settings.unit);
  } catch (e) {
    console.log(`\n  Error: ${e instanceof Error ? e.message : e}\n`);
  }
}

async function handleWeatherAll(settings: Settings) {
  if (settings.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Agrega una primero.\n");
    return;
  }
  console.log(`\n  Mostrando clima de ${settings.cities.length} ciudad(es)...\n`);
  for (const city of settings.cities) {
    try {
      const data = await getWeather(city, settings.unit);
      displayWeather(city, data, settings.unit);
    } catch (e) {
      console.log(
        `  Error al obtener clima de ${city.name}: ${e instanceof Error ? e.message : e}\n`
      );
    }
  }
}

async function handleAddCity(settings: Settings): Promise<boolean> {
  const query = await input({
    message: "Nombre de la ciudad a buscar:",
  });
  if (!query.trim()) return false;

  try {
    const response = await searchCities(query.trim());
    if (!response.results || response.results.length === 0) {
      console.log("\n  No se encontraron resultados.\n");
      return false;
    }

    const choices = response.results.map((r: GeocodingResult) => ({
      name: r.admin1
        ? `${r.name}, ${r.admin1}, ${r.country}`
        : `${r.name}, ${r.country}`,
      value: r,
    }));

    const selected = await select({
      message: "Selecciona una ciudad:",
      choices,
    });

    const alreadyExists = settings.cities.some(
      (c) =>
        c.latitude === selected.latitude &&
        c.longitude === selected.longitude
    );
    if (alreadyExists) {
      console.log("\n  Esa ciudad ya está guardada.\n");
      return false;
    }

    const newCity: City = {
      name: selected.name,
      latitude: selected.latitude,
      longitude: selected.longitude,
      country: selected.country,
      admin1: selected.admin1,
    };
    settings.cities.push(newCity);

    if (!settings.defaultCity) {
      settings.defaultCity = newCity.name;
      console.log(`\n  Ciudad agregada y establecida como default.\n`);
    } else {
      console.log(`\n  Ciudad agregada correctamente.\n`);
    }
    return true;
  } catch (e) {
    console.log(`\n  Error: ${e instanceof Error ? e.message : e}\n`);
    return false;
  }
}

async function handleDeleteCity(settings: Settings): Promise<boolean> {
  if (settings.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas.\n");
    return false;
  }

  const choices = settings.cities.map((c) => ({
    name: formatCityLabel(c),
    value: c.name,
  }));

  const selected = await select({
    message: "Ciudad a eliminar:",
    choices,
  });

  settings.cities = settings.cities.filter((c) => c.name !== selected);
  if (settings.defaultCity === selected) {
    settings.defaultCity = settings.cities[0]?.name || "";
  }
  console.log(`\n  Ciudad eliminada.\n`);
  return true;
}

async function handleSetDefault(settings: Settings): Promise<boolean> {
  if (settings.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas.\n");
    return false;
  }

  const choices = settings.cities.map((c) => ({
    name: formatCityLabel(c),
    value: c.name,
  }));

  const selected = await select({
    message: "Ciudad default:",
    choices,
  });

  settings.defaultCity = selected;
  console.log(`\n  Ciudad default establecida: ${selected}\n`);
  return true;
}

async function handleSettings(settings: Settings): Promise<boolean> {
  const newUnit = await select({
    message: "Unidad de temperatura:",
    choices: [
      { name: "Celsius (°C)", value: "C" as const },
      { name: "Fahrenheit (°F)", value: "F" as const },
    ],
  });
  settings.unit = newUnit;
  console.log(`\n  Unidad cambiada a ${newUnit === "C" ? "°C" : "°F"}\n`);
  return true;
}

export async function runMenu() {
  let settings = await loadSettings();

  console.log("\n════════════════════════════════════════");
  console.log("         WEATHER CLI");
  console.log("════════════════════════════════════════");

  let running = true;
  while (running) {
    const cityCount = settings.cities.length;
    const option = await select({
      message: "Selecciona una opción:",
      choices: [
        {
          name: "1. Clima de ciudad default",
          value: "weather_default",
        },
        {
          name: `2. Clima de todas las ciudades (${cityCount})`,
          value: "weather_all",
        },
        {
          name: "3. Buscar y agregar ciudad",
          value: "add_city",
        },
        {
          name: "4. Eliminar ciudad",
          value: "delete_city",
        },
        {
          name: "5. Establecer ciudad default",
          value: "set_default",
        },
        {
          name: `8. Ajustes (${settings.unit === "C" ? "°C" : "°F"})`,
          value: "settings",
        },
        {
          name: "9. Salir",
          value: "exit",
        },
      ],
    });

    let changed = false;

    switch (option) {
      case "weather_default":
        await handleWeatherDefault(settings);
        break;
      case "weather_all":
        await handleWeatherAll(settings);
        break;
      case "add_city":
        changed = await handleAddCity(settings);
        break;
      case "delete_city":
        changed = await handleDeleteCity(settings);
        break;
      case "set_default":
        changed = await handleSetDefault(settings);
        break;
      case "settings":
        changed = await handleSettings(settings);
        break;
      case "exit":
        running = false;
        break;
    }

    if (changed) {
      saveSettings(settings);
    }
  }

  console.log("\n  ¡Hasta luego!\n");
}
