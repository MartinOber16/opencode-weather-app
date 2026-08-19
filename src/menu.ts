import { select, input } from "@inquirer/prompts";
import type { City, Settings, GeocodingResult, WeatherResponse, DailyWeatherResponse } from "./types";
import { loadSettings, saveSettings } from "./storage";
import { searchCities, getWeather, getDailyForecast } from "./api";
import { cyan, yellow, green, red, bold, dim } from "./colors";

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

const LINE = cyan("════════════════════════════════════════");

function displayWeather(city: City, data: WeatherResponse, unit: "C" | "F") {
  const unitSymbol = unit === "C" ? "°C" : "°F";
  const condition = WEATHER_CODES[data.current.weather_code] || "Desconocido";
  const location = city.admin1
    ? `${city.name}, ${city.admin1}`
    : `${city.name}, ${city.country}`;

  console.log(`\n${LINE}`);
  console.log(`  ${cyan(bold(location))}`);
  console.log(LINE);
  console.log(`  Temperatura:     ${yellow(`${data.current.temperature_2m}${unitSymbol}`)}`);
  console.log(`  Sensación:       ${yellow(`${data.current.apparent_temperature}${unitSymbol}`)}`);
  console.log(`  Humedad:         ${data.current.relative_humidity_2m}%`);
  console.log(`  Viento:          ${data.current.wind_speed_10m} km/h`);
  console.log(`  Condición:       ${condition}`);
  console.log(`${LINE}\n`);
}

function displayDailyForecast(city: City, data: DailyWeatherResponse, unit: "C" | "F") {
  const unitSymbol = unit === "C" ? "°C" : "°F";
  const location = city.admin1
    ? `${city.name}, ${city.admin1}`
    : `${city.name}, ${city.country}`;

  console.log(`\n${LINE}`);
  console.log(`  ${cyan(bold(`${location} — Pronóstico 7 días`))}`);
  console.log(LINE);
  console.log(`  ${dim("Fecha")}    ${dim("Condición")}          ${dim("Mín")}    ${dim("Máx")}    ${dim("Lluvia")}  ${dim("Viento")}`);
  console.log(`  ${dim("─".repeat(60))}`);

  for (let i = 0; i < data.daily.time.length; i++) {
    const date = data.daily.time[i]!;
    const day = date.split("-").slice(1).reverse().join("/");
    const code = data.daily.weather_code[i]!;
    const condition = WEATHER_CODES[code] || "Desconocido";
    const min = data.daily.temperature_2m_min[i]!;
    const max = data.daily.temperature_2m_max[i]!;
    const rain = data.daily.precipitation_sum[i]!;
    const wind = data.daily.wind_speed_10m_max[i]!;

    const conditionPad = condition.padEnd(20);
    const rainStr = rain > 0 ? green(`${rain}mm`) : `${rain}mm`;

    console.log(
      `  ${day}  ${conditionPad} ${yellow(`${min}${unitSymbol}`)}  ${yellow(`${max}${unitSymbol}`)}  ${rainStr}    ${wind} km/h`
    );
  }

  console.log(`${LINE}\n`);
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
    console.log(`\n  ${red("No hay ciudad default configurada.")}\n`);
    return;
  }
  try {
    const data = await getWeather(city, settings.unit);
    displayWeather(city, data, settings.unit);
  } catch (e) {
    console.log(`\n  ${red(`Error: ${e instanceof Error ? e.message : e}`)}\n`);
  }
}

async function handleWeatherAll(settings: Settings) {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas. Agrega una primero.")}\n`);
    return;
  }
  console.log(`\n  ${cyan(`Mostrando clima de ${settings.cities.length} ciudad(es)...`)}\n`);
  for (const city of settings.cities) {
    try {
      const data = await getWeather(city, settings.unit);
      displayWeather(city, data, settings.unit);
    } catch (e) {
      console.log(
        `  ${red(`Error al obtener clima de ${city.name}: ${e instanceof Error ? e.message : e}`)}\n`
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
      console.log(`\n  ${red("No se encontraron resultados.")}\n`);
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
      console.log(`\n  ${red("Esa ciudad ya está guardada.")}\n`);
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
      console.log(`\n  ${green("Ciudad agregada y establecida como default.")}\n`);
    } else {
      console.log(`\n  ${green("Ciudad agregada correctamente.")}\n`);
    }
    return true;
  } catch (e) {
    console.log(`\n  ${red(`Error: ${e instanceof Error ? e.message : e}`)}\n`);
    return false;
  }
}

async function handleDeleteCity(settings: Settings): Promise<boolean> {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas.")}\n`);
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
  console.log(`\n  ${green("Ciudad eliminada.")}\n`);
  return true;
}

async function handleSetDefault(settings: Settings): Promise<boolean> {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas.")}\n`);
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
  console.log(`\n  ${green(`Ciudad default establecida: ${selected}`)}\n`);
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
  console.log(`\n  ${green(`Unidad cambiada a ${newUnit === "C" ? "°C" : "°F"}`)}\n`);
  return true;
}

async function handleDailyForecast(settings: Settings) {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas. Agrega una primero.")}\n`);
    return;
  }

  const choices = settings.cities.map((c) => ({
    name: formatCityLabel(c),
    value: c,
  }));

  const selected = await select({
    message: "Ciudad para el pronóstico:",
    choices,
  });

  try {
    const data = await getDailyForecast(selected, settings.unit);
    displayDailyForecast(selected, data, settings.unit);
  } catch (e) {
    console.log(`\n  ${red(`Error: ${e instanceof Error ? e.message : e}`)}\n`);
  }
}

export async function runMenu() {
  let settings = await loadSettings();

  console.log(`\n${LINE}`);
  console.log(`         ${cyan(bold("WEATHER CLI"))}`);
  console.log(LINE);

  let running = true;
  while (running) {
    const cityCount = settings.cities.length;
    const option = await select({
      message: "Selecciona una opción:",
      loop: false,
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
          name: "6. Pronóstico 7 días",
          value: "daily_forecast",
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
      case "daily_forecast":
        await handleDailyForecast(settings);
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

  console.log(`\n  ${green("¡Hasta luego!")}\n`);
}
