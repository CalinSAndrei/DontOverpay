# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CLAUDE.md Maintenance Rule

Keep this file current. On every major change: delete outdated sections, update what changed, add what's new. Never append stale info — replace it. Keep it short and specific.

## Project Overview

**DontOverpay** (design name: Pricehound) — a self-hosted price tracker for Romanian e-commerce retailers. Users paste a product URL; the app scrapes the price immediately, stores history, and re-scrapes every 12 hours via a background scheduler.

**Current state:** Backend only. Frontend (Next.js) is planned but not yet built.

## Running the App

```bash
# Install dependencies (first time)
pip install -r requirements.txt

# Start the dev server
uvicorn app.main:app --reload
```

API available at `http://localhost:8000`. Interactive docs at `/docs`.

On first run, `ensure_scrapling_installed()` in `app/core/setup.py` installs Playwright browser binaries. This writes a marker to `~/.scrapling/.installed` so it only runs once.

## Architecture

### Request → Scrape → Store flow

1. `POST /products/add/` receives a URL
2. `registry.scrape(url)` extracts the domain, looks up the right scraper class in `REGISTRY`, calls `get_price()` and `get_name()`
3. Result is inserted into `products` + initial row in `price_history`
4. `APScheduler` runs `insert_price_in_price_history(scrape)` every 12 hours, inserting a new `price_history` row per tracked product

### Scraper pattern

Every scraper lives in `app/scrapers/` and extends `BaseScraper` (two abstract methods: `get_price`, `get_name`). All scrapers use `scrapling.fetchers.StealthyFetcher` for headless, anti-bot-bypass fetching.

**Adding a new store:** create `app/scrapers/<store>.py`, implement `BaseScraper`, add one entry to `REGISTRY` in `app/scrapers/registry.py`. Nothing else changes.

### Database

Raw `sqlite3` — no ORM. Three tables: `products`, `price_history`, `alerts`.

- DB path defaults to the platform user data dir; override with `DONTOVERPAY_DATA` env var
- `get_conn()` in `database.py` sets `row_factory = sqlite3.Row` and enables foreign keys
- All queries are inline SQL in `database.py` functions

### Key files

| File                       | Role                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| `app/main.py`              | FastAPI app, lifespan (starts scheduler), router registration          |
| `app/core/database.py`     | All DB queries, `init_db()`, `insert_price_in_price_history()`         |
| `app/core/scheduler.py`    | APScheduler setup, 12-hour periodic scrape job                         |
| `app/core/setup.py`        | Scrapling one-time browser install                                     |
| `app/scrapers/registry.py` | Domain → scraper class map, `scrape()` entry point                     |
| `app/scrapers/utils.py`    | `parse_price()` (Romanian format: `1.299,99` → `1299.99`), `require()` |

## Working Rules

- **Verify before recommending** — before suggesting a function, file, or feature exists, grep for it. The design doc describes things not yet built (alerts, notifier, schemas, frontend).
- **Prefer targeted reads** — when architecture is understood from this file, read specific files rather than broad exploration.
- **No ORM** — all DB work goes in `database.py` as raw SQL. Don't introduce SQLAlchemy or similar without explicit discussion.

## Frontend (Vite + React + Tailwind)

Lives in `frontend/`. Design system locked in `frontend/style.md` — read it before touching UI.

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173 (proxies /products → :8000)
npm run build
```

**Stack:** React 18, Framer Motion 11, Recharts 2, Phosphor Icons (weight="light"), Geist + Geist Mono fonts, Tailwind 3.

**Design tokens** are CSS variables defined in `src/index.css` (`--bg-base`, `--accent`, `--text-primary`, etc.). All colors use OKLCH. Every number/price renders in `font-mono tabular-nums`.

**Component map:**

| File | Role |
|---|---|
| `src/App.jsx` | State root: products list, selectedId, showAdd |
| `src/api.js` | All fetch calls (`fetchProducts`, `addProduct`, etc.) |
| `src/components/Nav.jsx` | Floating pill nav |
| `src/components/ProductList.jsx` | Z-axis cascade product list |
| `src/components/ProductCard.jsx` | Single card (double-bezel, stagger offset by index) |
| `src/components/ProductDetail.jsx` | Detail view: price, stats, chart |
| `src/components/PriceChart.jsx` | Recharts area chart with custom tooltip |
| `src/components/AddForm.jsx` | Slide-in URL form (form-encoded POST) |
| `src/components/Skeletons.jsx` | Shimmer skeletons for loading states |

## Planned but not yet built

- Frontend (Next.js + Chart.js + Tailwind)
- Telegram notifications (`core/notifier.py`)
- Alert endpoints (`routes/alerts.py`)
- Scrapers for Altex and Cel.ro
- Pydantic request/response schemas (`models/schemas.py`)
- Docker / docker-compose setup
- CORS middleware (needed once frontend is added)
