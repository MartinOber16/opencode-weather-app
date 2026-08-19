import type { Settings } from "../types/City";
import { getDailyForecast } from "../api/weather";
import { displayDailyForecast } from "../presentation/output";
import { promptSelect } from "../presentation/input";
import { formatCityLabel } from "../utils/format";
import { red } from "../utils/colors";

export async function handleDailyForecast(settings: Settings) {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas. Agrega una primero.")}\n`);
    return;
  }

  const choices = settings.cities.map((c) => ({
    name: formatCityLabel(c),
    value: c,
  }));

  const selected = await promptSelect("Ciudad para el pronóstico:", choices);

  try {
    const data = await getDailyForecast(selected, settings.unit);
    displayDailyForecast(selected, data, settings.unit);
  } catch (e) {
    console.log(`\n  ${red(`Error: ${e instanceof Error ? e.message : e}`)}\n`);
  }
}
