import type { Settings } from "../types/City";
import { promptSelect } from "../presentation/input";
import { green } from "../utils/colors";

export async function handleSettings(settings: Settings): Promise<boolean> {
  const newUnit = await promptSelect("Unidad de temperatura:", [
    { name: "Celsius (°C)", value: "C" as const },
    { name: "Fahrenheit (°F)", value: "F" as const },
  ]);
  settings.unit = newUnit;
  console.log(`\n  ${green(`Unidad cambiada a ${newUnit === "C" ? "°C" : "°F"}`)}\n`);
  return true;
}
