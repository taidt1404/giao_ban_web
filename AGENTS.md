# AGENTS.md

Vite + React 19 + TypeScript hospital shift-report slide editor ("giao ban"). No tests, no linter, no CI.

## Commands

- `npm install` — requires Node.js 20+.
- `npm run dev` — Vite dev server, frontend only (no `/api/*`; server-mode sync disabled).
- `npm run build` — runs `tsc -b && vite build`. This is the typecheck; fix TS errors here.
- `npm run preview` — preview `dist/`.
- `npm run start:lan` — `node lan-server.js` (port `PORT` or 8080, binds `0.0.0.0`). Requires `dist/` built first.
- Windows LAN deploy: `Chay-Web-Giao-Ban-LAN.bat` (builds if `dist/index.html` missing, then starts server); `Mo-Cong-Tuong-Lua-8080.bat` opens firewall port 8080 (run as Administrator).

## Architecture

- Entrypoints: `src/main.tsx` → `src/App.tsx`; static server + JSON API: `lan-server.js` (plain Node `http`, no framework).
- `lan-server.js` serves `dist/` as SPA (unknown paths fall back to `index.html`) plus same-origin API under `/api/`: `status`, `dates`, `bundle/:date` (GET/POST/DELETE), `sync-legacy`, `export-all`.
- Frontend calls `fetch('/api/...')` with relative URLs — server features only work when served by `lan-server.js`, never under `npm run dev` (no Vite proxy configured).
- Data model: one `DailyGiaoBanBundle` per date (`YYYY-MM-DD`) in `src/utils/dailyStorage.ts` — fixed slides 1–4 (`report`, `outpatient`, `afterHours`, `inpatient`) + dynamic `freeTextSlides[]`, `soapSlides[]`, single `monitoring`, `patientCaseTableSlides[]`. Slide number in `App.tsx` is computed as `4 + freeText + soap + 1 + caseTables`; keep that order when adding slide types.
- Persistence is dual: browser `localStorage` (`giao-ban-bundle-<date>`, dates index, active date, plus legacy `giao-ban-slide-*-v1` keys auto-migrated on first load) and server files in `server-data/bundles/YYYY-MM-DD.json` + `server-data/dates-index.json`. App auto-pushes localStorage to server on startup and polls `/api/dates` every 20s. `saveDailyBundle` writes local only; server write happens via explicit API calls.
- Pairing convention: `src/components/EditorPanel*.tsx` (right input panel) ↔ `*Preview.tsx`/`Slide*Preview.tsx` (16:9 canvas). Per-slide defaults live in `src/data/*.ts` (`defaultReport`, `defaultOutpatientReport`, …). Word export (`docx` lib) is lazy-loaded in `src/utils/exportWord.ts` via `downloadGiaoBanWord(...)`.

## Gotchas

- `server-data/` is gitignored hospital data — never commit it. `dist/` is also ignored; LAN clients need a fresh `npm run build`.
- `package.json` pins `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `lucide-react` to `latest` — `npm install` can shift versions; trust `package-lock.json` and verify build after upgrades.
- `lan-server.js` rejects POST bodies >50MB and validates bundle dates strictly as `YYYY-MM-DD`.
- Print/PDF uses `window.print()` + `src/styles.css` print rules, not a library.
