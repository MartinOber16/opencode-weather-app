import type { Settings } from "../types/City";
import { loadSettings, saveSettings } from "../storage/settingsStorage";
import { promptSelect } from "./input";
import { LINE } from "./output";
import { handleWeatherDefault, handleWeatherAll } from "../actions/getWeather";
import { handleAddCity } from "../actions/addCity";
import { handleDeleteCity } from "../actions/removeCity";
import { handleSetDefault } from "../actions/setDefaultCity";
import { handleDailyForecast } from "../actions/handleDailyForecast";
import { handleSettings } from "../actions/handleSettings";
import { cyan, bold, green } from "../utils/colors";

export async function runMenu() {
  let settings = await loadSettings();

  console.log(`\n${LINE}`);
  console.log(`         ${cyan(bold("WEATHER CLI"))}`);
  console.log(LINE);

  let running = true;
  while (running) {
    const cityCount = settings.cities.length;
    const option = await promptSelect(
      "Selecciona una opción:",
      [
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
      false
    );

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
