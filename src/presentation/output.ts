import type { City } from "../types/City";
import type { WeatherResponse, DailyWeatherResponse } from "../types/Weather";
import { cyan, yellow, green, bold, dim } from "../utils/colors";
import { WEATHER_CODES, formatLocation } from "../utils/format";

export const LINE = cyan("════════════════════════════════════════");

export function displayWeather(city: City, data: WeatherResponse, unit: "C" | "F") {
  const unitSymbol = unit === "C" ? "°C" : "°F";
  const condition = WEATHER_CODES[data.current.weather_code] || "Desconocido";
  const location = formatLocation(city);

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

export function displayDailyForecast(city: City, data: DailyWeatherResponse, unit: "C" | "F") {
  const unitSymbol = unit === "C" ? "°C" : "°F";
  const location = formatLocation(city);

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
