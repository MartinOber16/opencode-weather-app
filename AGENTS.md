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
- `src/colors.ts` — Terminal color helpers via `picocolors`
- `src/index.ts` — Entry point, calls `runMenu()`

## Dependencies

- `@inquirer/prompts` — interactive CLI prompts
- `picocolors` — terminal colors (cyan=menu, yellow=temp, green=ok, red=error)

## API

The app uses OpenMeteo (no API key required):
1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=5&language=es&format=json`
2. Current forecast: `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=...&temperature_unit={celsius|fahrenheit}`
3. Daily forecast: same endpoint with `&daily=weather_code,temperature_2m_max,temperature_2m_min,...&timezone=auto`

## Persistence

Cities and settings are stored in `cities.json` (created automatically on first run).

## Language

README and app UI are in **Spanish**. Keep new code/comments/user-facing strings in Spanish to match.
