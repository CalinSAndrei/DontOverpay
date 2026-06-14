# Docker Quickstart

This app runs as two Docker images managed by Compose:

- `dontoverpay-backend:local`: FastAPI, scraper dependencies, Chromium browser support, and SQLite.
- `dontoverpay-frontend:local`: Vite build served by nginx.

SQLite data is stored in the named Docker volume `dontoverpay-data`, so products and price history survive container rebuilds.

## Run

From the repo root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

## Stop

```bash
docker compose down
```

## Reset Data

This deletes the SQLite volume:

```bash
docker compose down -v
```

## Rebuild After Code Changes

```bash
docker compose up --build
```

## What Happens

1. Docker builds the backend from the root `Dockerfile`.
2. Docker installs Python dependencies, skips Windows-only `pywin32`, and installs Chromium for scraping.
3. Docker builds the frontend with `npm ci && npm run build`.
4. nginx serves the frontend and proxies `/products` and `/logs` to the backend container.

The backend database path is configured with:

```text
DONTOVERPAY_DATA=/data
```
