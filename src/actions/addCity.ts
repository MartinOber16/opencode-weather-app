import type { City, Settings } from "../types/City";
import type { GeocodingResult } from "../types/Weather";
import { searchCities } from "../api/geocoding";
import { promptInput, promptSelect } from "../presentation/input";
import { red, green } from "../utils/colors";

export async function handleAddCity(settings: Settings): Promise<boolean> {
  const query = await promptInput("Nombre de la ciudad a buscar:");
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

    const selected = await promptSelect("Selecciona una ciudad:", choices);

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
