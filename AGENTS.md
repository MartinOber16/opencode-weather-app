# AGENTS.md

## Runtime

- **Bun**, not Node. Use `bun run`, `bun install`, `bun build`, etc.
- Single entrypoint: `src/index.ts` (ESM, `"module": "src/index.ts"` in package.json).

## TypeScript

- Strict mode enabled, `noEmit: true` (Bun runs TS directly, no tsc emit step).
- `verbatimModuleSyntax` is on: use `import type` for type-only imports.
- Type check: `bunx tsc --noEmit`

## Architecture

- `src/types.ts` — Shared types (City, Settings, API responses)
- `src/storage.ts` — JSON file persistence (`cities.json`) for cities and settings
- `src/api.ts` — OpenMeteo API calls (geocoding + forecast)
- `src/menu.ts` — Interactive CLI menu with `@inquirer/prompts`
- `src/index.ts` — Entry point, calls `runMenu()`

## API

The app uses OpenMeteo (no API key required):
1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=5&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&temperature_unit={celsius|fahrenheit}`

## Persistence

Cities and settings are stored in `cities.json` (created automatically on first run).

## Language

README and app UI are in **Spanish**. Keep new code/comments/user-facing strings in Spanish to match.
