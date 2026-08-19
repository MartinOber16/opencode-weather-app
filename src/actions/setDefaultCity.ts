import type { Settings } from "../types/City";
import { promptSelect } from "../presentation/input";
import { formatCityLabel } from "../utils/format";
import { red, green } from "../utils/colors";

export async function handleSetDefault(settings: Settings): Promise<boolean> {
  if (settings.cities.length === 0) {
    console.log(`\n  ${red("No hay ciudades guardadas.")}\n`);
    return false;
  }

  const choices = settings.cities.map((c) => ({
    name: formatCityLabel(c),
    value: c.name,
  }));

  const selected = await promptSelect("Ciudad default:", choices);

  settings.defaultCity = selected;
  console.log(`\n  ${green(`Ciudad default establecida: ${selected}`)}\n`);
  return true;
}
