# Pricehound

> A self-hosted price tracker built for local markets. Track tech products across Romanian retailers, get notified when prices drop, and own your data.

---

## Tech Stack

### Backend

| Layer | Tool | Why |
|---|---|---|
| Framework | FastAPI | Modern, async, minimal boilerplate |
| Scraping | Scrapling | Adaptive parsing + built-in anti-bot bypass |
| Database | SQLite | Zero config, perfect for Pi/VPS scale |
| Scheduler | APScheduler | Simple in-process job scheduling |
| Notifications | Telegram Bot API | Free, mobile-friendly, easy to set up |
| Deployment | Docker + Compose | Same config on Pi or VPS, one command to run |

### Frontend

| Layer | Tool | Why |
|---|---|---|
| Templating | HTMX + Jinja2 | No JS build step, renders server-side |
| Charts | Chart.js | Just a script tag, no npm needed |

---

## MVP Scope

The MVP does one thing well: you give it a product URL, it tracks the price over time, and it tells you when the price drops.

**What's in:**
- Add a product by pasting its URL
- Auto-detect the store from the URL
- Scrape and store the current price immediately on add
- Check prices on a configurable schedule (default every 6 hours)
- Store full price history per product
- Send a Telegram notification when a price drops below a set threshold
- Web UI to view tracked products and their price history graphs
- Support for Emag, PCGarage, Altex, Cel.ro at launch

**What's not in yet:**
- Search by product name across stores
- Multi-store comparison view
- User accounts or auth
- Mobile app
- Any store outside Romania

---

## File Structure

```
pricehound/
│
├── app/
│   ├── main.py                  # FastAPI app entry point
│   │
│   ├── core/
│   │   ├── database.py          # SQLite connection, queries, migrations
│   │   ├── scheduler.py         # APScheduler setup and job registration
│   │   └── notifier.py          # Telegram notification logic
│   │
│   ├── scrapers/
│   │   ├── base.py              # BaseScraper abstract class
│   │   ├── registry.py          # Maps domains to scraper classes
│   │   ├── emag.py
│   │   ├── pcgarage.py
│   │   ├── altex.py
│   │   └── cel.py
│   │
│   ├── models/
│   │   └── schemas.py           # Product, PriceRecord, Alert data models
│   │
│   ├── routes/
│   │   ├── products.py          # Add, remove, view products
│   │   └── alerts.py            # Set and manage price alerts
│   │
│   └── templates/
│       ├── base.html            # Shared layout
│       ├── index.html           # Product list dashboard
│       └── product.html         # Single product page with price history graph
│
├── config.yaml                  # Check intervals, Telegram token, active scrapers
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## Database Schema

Three tables. That's all the MVP needs.

**products**
```
id            INTEGER PRIMARY KEY
url           TEXT UNIQUE
name          TEXT
store         TEXT           -- "emag", "pcgarage", etc.
currency      TEXT           -- "RON", "EUR"
current_price REAL
last_checked  TIMESTAMP
created_at    TIMESTAMP
```

**price_history**
```
id            INTEGER PRIMARY KEY
product_id    INTEGER        -- FK -> products.id
price         REAL
recorded_at   TIMESTAMP
```

**alerts**
```
id            INTEGER PRIMARY KEY
product_id    INTEGER        -- FK -> products.id
target_price  REAL           -- notify when price drops below this
triggered     BOOLEAN        -- avoid repeat notifications
created_at    TIMESTAMP
```

---

## How the Scraper Layer Works

Every store scraper extends `BaseScraper` and implements two methods: `get_price` and `get_name`. That's the full contract.

```python
# base.py
class BaseScraper(ABC):
    @abstractmethod
    def get_price(self, url: str) -> float: pass

    @abstractmethod
    def get_name(self, url: str) -> str: pass
```

```python
# emag.py
class EmagScraper(BaseScraper):
    def get_price(self, url: str) -> float:
        page = StealthyFetcher.fetch(url, headless=True)
        raw = page.css('.product-new-price', auto_save=True).text
        return self._parse_price(raw)

    def _parse_price(self, raw: str) -> float:
        # "1.299,99 Lei" -> 1299.99
        cleaned = raw.replace("Lei", "").replace(".", "").replace(",", ".").strip()
        return float(cleaned)
```

The registry maps domains to scraper classes so the rest of the app never needs to care which store it's talking to:

```python
# registry.py
REGISTRY = {
    "emag.ro": EmagScraper,
    "pcgarage.ro": PCGarageScraper,
    "altex.ro": AltexScraper,
    "cel.ro": CelScraper,
}

def get_scraper(url: str) -> BaseScraper:
    domain = extract_domain(url)
    scraper_class = REGISTRY.get(domain)
    if not scraper_class:
        raise ValueError(f"No scraper registered for {domain}")
    return scraper_class()
```

Adding a new store means writing one new file and adding one line to the registry. Nothing else changes.

---

## Full Data Flow

```
1. User pastes a URL into the web UI
        |
2. FastAPI detects the domain, picks the right scraper from registry
        |
3. Scraper fetches the page, returns name + price
        |
4. Product saved to `products` table
   Price saved to `price_history` table
        |
5. APScheduler runs a check job every N hours (set in config.yaml)
        |
6. For each tracked product:
   - Scrape current price
   - Write new row to price_history
   - Compare against alert threshold
        |
7. If price dropped below threshold:
   - Fire Telegram notification
   - Mark alert as triggered
        |
8. Web UI reads price_history and renders Chart.js graph
```

---

## Config

Everything environment-specific lives in `config.yaml`. No hardcoded values anywhere in the codebase.

```yaml
telegram:
  bot_token: "YOUR_BOT_TOKEN"
  chat_id: "YOUR_CHAT_ID"

scheduler:
  check_interval_hours: 6

scrapers:
  active:
    - emag.ro
    - pcgarage.ro
    - altex.ro
    - cel.ro
```

---

## Running It

```bash
# Clone and configure
git clone https://github.com/you/pricehound
cp config.example.yaml config.yaml
# fill in your Telegram token

# Run
docker compose up -d
```

Open `http://localhost:8000` and start tracking.

---

## What Comes After MVP

These are deliberately out of scope for v1 but the architecture supports them cleanly:

- **Search flow** - type a product name, get results from all stores, click to track
- **Multi-store comparison** - see the same product across stores side by side
- **Country packs** - drop in scrapers for Polish, Hungarian, or other local stores
- **Price drop history** - see how many times a product has been on sale
- **Auth** - if you want to share the instance with friends