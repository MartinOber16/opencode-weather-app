import type { Settings } from "../types/City";
import { promptSelect } from "../presentation/input";
import { formatCityLabel } from "../utils/format";
import { red, green } from "../utils/colors";

export async function handleDeleteCity(settings: Settings): Promise<boolean> {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas.")}\n`);
    return false;
  }

  const choices = settings.cities.map((c) => ({
    name: formatCityLabel(c),
    value: c.name,
  }));

  const selected = await promptSelect("Ciudad a eliminar:", choices);

  settings.cities = settings.cities.filter((c) => c.name !== selected);
  if (settings.defaultCity === selected) {
    settings.defaultCity = settings.cities[0]?.name || "";
  }
  console.log(`\n  ${green("Ciudad eliminada.")}\n`);
  return true;
}
