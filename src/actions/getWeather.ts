import type { Settings } from "../types/City";
import { getWeather } from "../api/weather";
import { displayWeather } from "../presentation/output";
import { red, cyan } from "../utils/colors";

export async function handleWeatherDefault(settings: Settings) {
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

export async function handleWeatherAll(settings: Settings) {
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
