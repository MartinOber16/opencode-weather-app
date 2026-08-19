import { select, input } from "@inquirer/prompts";

export async function promptInput(message: string): Promise<string> {
  return input({ message });
}

export async function promptSelect<T>(
  message: string,
  choices: { name: string; value: T }[],
  loop = false
): Promise<T> {
  return select({ message, choices, loop });
}
