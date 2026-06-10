# Deploying DontOverpay with Docker, nginx, and Local DNS

A complete beginner's guide to containerizing this app and making it accessible from anywhere on your home network.

---

## Before You Start — What to Read/Watch First

You don't need to finish all of these before continuing, but skim them so the concepts below feel familiar.

| Resource                                                                                                  | What it covers                                                                |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Docker — Get Started](https://docs.docker.com/get-started/)                                              | Official intro, covers images, containers, volumes, compose. Read parts 1–5.  |
| [Play with Docker](https://labs.play-with-docker.com/)                                                    | Free browser-based Docker playground — experiment without installing anything |
| [nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)                                  | Short, official. Explains config blocks, server, location directives          |
| [Docker in 100 seconds](https://www.youtube.com/watch?v=Gjnup-PuquQ) (Fireship, YouTube)                  | 100-second visual explainer of the core idea                                  |
| [you need to learn Docker RIGHT NOW](https://www.youtube.com/watch?v=eGz9DS-aIeY) (NetworkChuck, YouTube) | Hands-on beginner walkthrough, ~30 min                                        |

---

## Part 1 — Core Concepts

### What is Docker?

Docker is a tool that packages your application and everything it needs to run (Python version, libraries, config files) into a single portable unit called a **container**.

Think of it like a shipping container: the ship (your server/PC) doesn't need to know what's inside — it just carries the container. The container works the same everywhere.

**Key terms:**

| Term               | What it means                                                                              |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Image**          | The blueprint. A read-only snapshot of your app + dependencies. Like a class in OOP.       |
| **Container**      | A running instance of an image. Like an object created from a class.                       |
| **Dockerfile**     | A text file with instructions to build an image.                                           |
| **Volume**         | A folder that lives outside the container so data persists when the container restarts.    |
| **Network**        | A virtual network Docker creates so containers can talk to each other.                     |
| **docker-compose** | A tool to define and run multiple containers together using one `docker-compose.yml` file. |

### What is nginx?

nginx (pronounced "engine-x") is a very fast, lightweight web server. It has two jobs that matter to us:

1. **Serve static files** — HTML, CSS, JS from your built React app
2. **Reverse proxy** — receive a request and forward it to another server (the FastAPI backend), then return the response to the client

The client (browser) only ever talks to nginx. nginx decides where the request goes based on the URL path.

```
Browser
  │
  │  GET /              → nginx serves index.html (React app)
  │  GET /products      → nginx proxies to FastAPI on port 8000
  ▼
nginx (port 80)
  ├──► React static files  (for / and all non-API paths)
  └──► FastAPI :8000        (for /products/*)
```

---

## Part 2 — The Architecture We're Building

Two Docker containers, one volume, one shared network:

```
┌─────────────────────────────────────────┐
│  docker-compose                         │
│                                         │
│  ┌──────────────┐   ┌────────────────┐  │
│  │   frontend   │   │    backend     │  │
│  │   (nginx)    │   │   (FastAPI)    │  │
│  │   port 80    │──►│   port 8000    │  │
│  └──────────────┘   └───────┬────────┘  │
│                             │           │
│                     ┌───────▼────────┐  │
│                     │  db-data       │  │
│                     │  (volume)      │  │
│                     │  dontoverpay   │  │
│                     │  .db           │  │
│                     └────────────────┘  │
└─────────────────────────────────────────┘
         │
    port 80 exposed to your LAN
         │
    any device on your network
```

---

## Part 3 — Step-by-Step Setup

### Step 1: Install Docker Desktop

Download from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

After installing, open a terminal and verify:

```bash
docker --version
docker compose version
```

Both should print version numbers.

---

### Step 2: Write the Backend Dockerfile

A `Dockerfile` is a recipe for building your image. Create `Dockerfile` in the project root (next to `requirements.txt`):

```dockerfile
# Start from an official Python image
FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Copy requirements first (Docker caches this layer — faster rebuilds)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (needed by scrapling)
RUN playwright install --with-deps chromium

# Copy the rest of the app
COPY app/ ./app/

# Tell uvicorn to listen on all interfaces (0.0.0.0), not just localhost
# Port 8000 is the internal container port
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Why `0.0.0.0`?** By default, uvicorn only accepts connections from the same machine (`127.0.0.1`). Inside Docker, other containers are not "the same machine" — they connect over Docker's virtual network. `0.0.0.0` means "accept from anywhere that can reach me."

---

### Step 3: Build the React Frontend

Before Docker can serve the frontend, you need to produce the built static files.

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/` — a folder of plain HTML/CSS/JS that nginx will serve. **You only need to re-run this when you change frontend code.**

---

### Step 4: Write the nginx Config

nginx uses a config file to know how to route requests. Create `nginx/nginx.conf`:

```nginx
server {
    listen 80;

    # Serve the React app for any path that isn't /products
    location / {
        root /usr/share/nginx/html;
        index index.html;
        # This makes React's client-side routing work:
        # if the file doesn't exist, serve index.html anyway
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the FastAPI backend
    location /products {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Key things to understand:**

- `listen 80` — nginx listens on port 80 (standard HTTP)
- `location /` — matches all URLs; serves static files from `/usr/share/nginx/html` (that's where we'll put the built React files)
- `try_files $uri $uri/ /index.html` — if the file doesn't exist (e.g. `/products/5` is a React route, not a real file), serve `index.html` and let React handle the routing
- `proxy_pass http://backend:8000` — `backend` is the name of the FastAPI container. Docker's internal DNS resolves container names automatically — this is why they're in the same docker-compose network
- `proxy_set_header` — these pass the real client IP through to FastAPI, useful for logging

---

### Step 5: Write docker-compose.yml

Create `docker-compose.yml` in the project root:

```yaml
services:
  backend:
    build: . # Build using the Dockerfile in this directory
    environment:
      - DONTOVERPAY_DATA=/data # Tell the app where to store the DB
    volumes:
      - db-data:/data # Mount the volume at /data inside the container
    restart: unless-stopped # Auto-restart if the container crashes

  frontend:
    image: nginx:alpine # Use the official nginx image (no custom build needed)
    ports:
      - "80:80" # Expose port 80 to your LAN
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro # Mount built React files (read-only)
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro # Mount nginx config
    depends_on:
      - backend # Start backend before frontend
    restart: unless-stopped

volumes:
  db-data: # Named volume — Docker manages this on disk
```

**Understanding the volumes section:**

- `db-data:/data` — this maps a Docker-managed volume called `db-data` to the `/data` folder inside the container. The SQLite file lives here. When the container is deleted and recreated, the data in `db-data` persists.
- `./frontend/dist:/usr/share/nginx/html:ro` — this mounts your local `frontend/dist` folder directly into nginx. No rebuild of the Docker image needed when you update the frontend — just run `npm run build` and the new files appear immediately.
- `:ro` means read-only — the container can't write to your source files.

**Understanding `depends_on`:**  
This tells Docker to start `backend` before `frontend`. Note: it only waits for the container to _start_, not for FastAPI to be fully ready. For this app that's fine since nginx will retry proxied requests.

---

### Step 6: Run It

```bash
# Build the backend image and start everything
docker compose up --build

# Or run in the background (detached mode)
docker compose up --build -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Stop and delete the volume (WARNING: deletes your database)
docker compose down -v
```

Once running, open `http://localhost` in your browser — you should see the app.

---

## Part 4 — Accessing the App From Other Devices on Your Network

Right now the app runs on your PC. Any device on your home Wi-Fi can reach it — but they need to use your PC's **local IP address**, not `localhost` (localhost only means "this machine").

### Find your PC's local IP

```powershell
ipconfig
```

Look for "IPv4 Address" under your active adapter (Wi-Fi or Ethernet). It'll look like `192.168.1.x` or `10.0.0.x`.

From another device on your network, open `http://192.168.1.x` — the app should load.

### Make the IP permanent (recommended)

Home routers assign IPs via DHCP, which can change. To make your PC always get the same IP:

1. Open your router admin panel (usually `http://192.168.1.1` or `http://192.168.0.1`)
2. Find **DHCP reservations** (also called "Static IP" or "Address Reservation")
3. Add your PC's MAC address → assign it a fixed IP (e.g. `192.168.1.100`)

Now your PC's IP won't change after reboots.

---

## Part 5 — Setting a DNS Alias (So You Type a Name, Not an IP)

Instead of `http://192.168.1.100`, you want to type something like `http://pricehound` or `http://pricehound.home`.

This is **local DNS** — your router resolves the name to the IP on your local network only.

### Option A: Router's Built-in DNS (Recommended if supported)

Most modern routers (especially those running custom firmware) have a "custom DNS" or "local DNS" section.

**For ASUS routers (stock firmware):**

1. Router admin → LAN → DNS Filter or DHCP server
2. Look for "Custom DNS entries" or check if your model supports it. Many ASUS stock firmware versions do _not_ support custom hostnames — if that's the case, use Option B or C.

**For routers running OpenWRT:**

1. Network → DHCP and DNS → Hostnames
2. Add: hostname `pricehound` → IP `192.168.1.100`

**For routers running DD-WRT:**

1. Services → Services → DNSMasq
2. In "Additional DNSMasq Options" add: `address=/pricehound/192.168.1.100`

**For pfSense / OPNsense:**

1. Services → DNS Resolver → Host Overrides
2. Add hostname + IP

### Option B: Pi-hole or AdGuard Home (Best Option for Home Networks)

If your router doesn't support custom DNS entries (most consumer routers don't), run a local DNS server instead. **AdGuard Home** and **Pi-hole** are both free, self-hosted, and run well on a Raspberry Pi or even in a Docker container on your PC.

Once installed, you point your router's DNS to the Pi-hole/AdGuard IP, and add custom DNS records there.

AdGuard Home setup: [https://github.com/AdguardTeam/AdGuardHome#getting-started](https://github.com/AdguardTeam/AdGuardHome#getting-started)

### Option C: `/etc/hosts` File (Simplest, Works on a Single Device)

If you only need the alias on your own PC (not phone/tablet/etc.), edit the hosts file:

**Windows** — open Notepad as Administrator, edit `C:\Windows\System32\drivers\etc\hosts`, add:

```
192.168.1.100   pricehound
```

Save. Now `http://pricehound` works in your browser on that PC only.

---

## Part 6 — Accessing From Outside Your Home Network

> **Important distinction:** everything above makes the app accessible on your home Wi-Fi (LAN). Accessing it from a coffee shop or your phone on mobile data (WAN) requires extra steps.

### Option A: Port Forwarding + Dynamic DNS

1. **Port forwarding** — in your router, forward external port 80 to your PC's internal IP:80. Now `http://<your-public-IP>` reaches the app.
2. **Dynamic DNS** — your home public IP changes over time. Services like [DuckDNS](https://www.duckdns.org/) give you a free hostname (e.g. `yourname.duckdns.org`) that always points to your current public IP.

⚠️ **Security note:** exposing port 80 directly to the internet without HTTPS and authentication is risky. For a personal tool, consider adding HTTP basic auth in nginx, or use Option B instead.

### Option B: Cloudflare Tunnel (Recommended for WAN Access)

Cloudflare Tunnel creates an encrypted outbound connection from your server to Cloudflare's network — no port forwarding needed, and it gives you HTTPS automatically.

Guide: [https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/)

---

## Part 7 — Final File Structure

After following this guide, your project should look like:

```
DontOverpay/
├── app/
│   ├── main.py
│   ├── core/
│   └── scrapers/
├── frontend/
│   ├── src/
│   ├── dist/          ← built by `npm run build`
│   └── package.json
├── nginx/
│   └── nginx.conf     ← new
├── docs/
│   └── docker-deployment-guide.md
├── Dockerfile         ← new
├── docker-compose.yml ← new
└── requirements.txt
```

---

## Quick Reference

```bash
# First time setup
cd frontend && npm run build && cd ..
docker compose up --build -d

# View running containers
docker ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild after backend code changes
docker compose up --build -d

# Rebuild after frontend changes
cd frontend && npm run build && cd ..
# No need to rebuild Docker — volume mount picks up changes automatically

# Stop
docker compose down

# Check what's using port 80
netstat -ano | findstr :80
```

---

## Troubleshooting

| Problem                                    | Likely cause                         | Fix                                                                   |
| ------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------- |
| `port 80 is already in use`                | IIS or another web server is running | Stop IIS: `iisreset /stop` or change port to `8080:80` in compose     |
| Frontend loads but `/products` returns 502 | Backend not ready yet                | Wait a few seconds and refresh; check `docker compose logs backend`   |
| Changes to frontend don't appear           | Browser cache                        | Hard refresh (Ctrl+Shift+R)                                           |
| Container keeps restarting                 | App crash                            | Check `docker compose logs backend` for Python errors                 |
| Can't reach from phone                     | Firewall blocking port 80            | Windows Defender Firewall → Allow an app → add Docker or open port 80 |
