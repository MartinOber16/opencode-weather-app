# AGENTS.md

## Runtime

- **Bun**, not Node. Use `bun run`, `bun install`, `bun build`, etc.
- Single entrypoint: `index.ts` (ESM, `"module": "index.ts"` in package.json).

## TypeScript

- Strict mode enabled, `noEmit: true` (Bun runs TS directly, no tsc emit step).
- `verbatimModuleSyntax` is on: use `import type` for type-only imports.

## API

The app uses OpenMeteo (no API key required):
1. Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=1&language=es&format=json`
2. Forecast: `https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m`

## Language

README and app UI are in **Spanish**. Keep new code/comments/user-facing strings in Spanish to match.
