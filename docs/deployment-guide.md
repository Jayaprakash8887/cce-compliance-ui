# Deployment Guide

> **CCE Compliance UI** — Docker container deployment on EC2  
> **Version**: 1.0.0 | **Last Updated**: 2026-03-30

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Build the Docker Image](#3-build-the-docker-image)
4. [Configure Host Caddy](#4-configure-host-caddy)
5. [Deploy the Container](#5-deploy-the-container)
6. [Health Check & Verification](#6-health-check--verification)
7. [Updating the Deployment](#7-updating-the-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Overview

The Compliance UI is deployed as a Docker container that serves the static React SPA. The **host Caddy** (already running on EC2) acts as the front-facing reverse proxy, routing browser traffic to the UI container and API calls to the CCE Gateway.

```
                     Browser
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│  EC2 Instance                                             │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Host Caddy (already deployed)                      │  │
│  │  ├── /*      →  compliance-ui container :3000       │  │
│  │  └── /v1/*   →  CCE Gateway :8060                    │  │
│  └─────────────────────────────────────────────────────┘  │
│           │                          │                    │
│           ▼                          ▼                    │
│  ┌──────────────────┐   ┌─────────────────────────┐      │
│  │ Docker container  │   │  CCE Gateway          │      │
│  │ cce-compliance-ui │   │  (port 8060)           │      │
│  │ Caddy :3000       │   │  └─→ Compliance Service │      │
│  │ └── static SPA    │   │      (port 8080)       │      │
│  └──────────────────┘   └─────────────────────────┘      │
└───────────────────────────────────────────────────────────┘
```

**Key points:**
- The container only serves static files — no API proxying happens inside it
- The host Caddy handles routing: `/v1/*` → CCE Gateway, everything else → UI container
- The container runs its own lightweight Caddy for SPA routing (`try_files`) and asset caching

---

## 2. Prerequisites

| Requirement | Details |
|---|---|
| **EC2 Instance** | With Caddy already installed and running |
| **Docker** | 24+ installed and running |
| **CCE Gateway** | Running and accessible (port 8060) |
| **Compliance Service** | Running behind the Gateway (port 8080) |

Verify prerequisites:

```bash
caddy version            # Host Caddy installed
docker --version         # Docker available
curl -s http://localhost:8060/actuator/health   # CCE Gateway up
curl -s http://localhost:8080/actuator/health   # Compliance Service up
```

---

## 3. Build the Docker Image

### Option A: Build on EC2

```bash
git clone <repo-url> cce-compliance-ui
cd cce-compliance-ui
docker build -t cce-compliance-ui:latest .
```

### Option B: Build Locally and Transfer

```bash
# Build locally
docker build -t cce-compliance-ui:latest .

# Save and transfer
docker save cce-compliance-ui:latest | gzip > cce-compliance-ui.tar.gz
scp cce-compliance-ui.tar.gz ec2-user@<EC2_IP>:~/

# On EC2
docker load < cce-compliance-ui.tar.gz
```

### Option C: Container Registry

```bash
# Tag and push
docker tag cce-compliance-ui:latest <registry>/cce-compliance-ui:latest
docker push <registry>/cce-compliance-ui:latest

# On EC2
docker pull <registry>/cce-compliance-ui:latest
```

### Dockerfile Details

Multi-stage build: `node:22-alpine` (build) → `caddy:2-alpine` (serve). The container's Caddy only serves static files with SPA routing. Final image size: ~50 MB.

### Build-Time Variables

These are baked into the JS bundle. For Docker deployments, set `VITE_API_BASE_URL` to empty so the UI uses relative paths (`/v1/...`) which the host Caddy proxies:

```bash
docker build --build-arg VITE_API_BASE_URL= -t cce-compliance-ui:latest .
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Set to empty for Docker (host Caddy proxies) |
| `VITE_AUTH_ENABLED` | `false` | Enable OAuth token |
| `VITE_AUTH_TOKEN` | _(empty)_ | Pre-seeded Bearer token (overrides sessionStorage) |
| `VITE_POLLING_INTERVAL` | `30000` | Auto-refresh interval (ms) |

---

## 4. Configure Host Caddy

Add a site block to the host Caddy configuration so it routes traffic to the UI container and the CCE Gateway. A reference snippet is provided at `deploy/caddy-site.example`.

### Example: Plain HTTP (Demo)

```caddyfile
:80 {
    # API calls → CCE Gateway
    handle /v1/* {
        reverse_proxy localhost:8060 {
            header_up Host {upstream_hostport}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }

    # Everything else → Compliance UI container
    handle {
        reverse_proxy localhost:3000
    }
}
```

### Example: With Domain + HTTPS

```caddyfile
cce-demo.example.com {
    # API calls → CCE Gateway
    handle /v1/* {
        reverse_proxy localhost:8060 {
            header_up Host {upstream_hostport}
            header_up X-Real-IP {remote_host}
            header_up X-Forwarded-For {remote_host}
            header_up X-Forwarded-Proto {scheme}
        }
    }

    # Everything else → Compliance UI container
    handle {
        reverse_proxy localhost:3000
    }
}
```

> With a domain, Caddy automatically provisions TLS via Let's Encrypt — no manual certificate management.

### Apply Configuration

```bash
# Edit the host Caddyfile
sudo vi /etc/caddy/Caddyfile

# Validate and reload
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

---

## 5. Deploy the Container

### 5.1 Run the Container

```bash
docker run -d \
  --name cce-compliance-ui \
  --restart unless-stopped \
  -p 3000:3000 \
  cce-compliance-ui:latest
```

The container exposes port 3000. The host Caddy reverse-proxies to it — **do not** expose port 3000 in the EC2 security group; let Caddy handle external access.

### 5.2 Run with Docker Compose

Create `docker-compose.yml`:

```yaml
services:
  compliance-ui:
    image: cce-compliance-ui:latest
    container_name: cce-compliance-ui
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"   # bind to localhost only — Caddy proxies
```

```bash
docker compose up -d
```

### 5.3 Security Group Rules

| Type | Port | Source | Purpose |
|---|---|---|---|
| HTTP | 80 | 0.0.0.0/0 | Host Caddy (or 443 for HTTPS) |
| Custom TCP | 3000 | Not needed | Container accessed via host Caddy only |
| Custom TCP | 8080 | 127.0.0.1 | Compliance Service (localhost only) |

---

## 6. Health Check & Verification

### Verify Container is Running

```bash
docker ps | grep cce-compliance-ui
docker logs cce-compliance-ui
```

### Verify Container Serves SPA

```bash
curl -s http://localhost:3000/ | head -5
# Should return HTML with <div id="root">
```

### Verify Host Caddy Routes UI

```bash
curl -s http://localhost/ | head -5
# Should return same HTML as above
```

### Verify Host Caddy Routes API

```bash
curl -s http://localhost/v1/protocol-definitions | head -20
# Should return JSON from Compliance Service
```

### Docker Health Check

Add to `docker-compose.yml`:

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

---

## 7. Updating the Deployment

### Rolling Update

```bash
# Build new image
docker build -t cce-compliance-ui:latest .

# Replace container
docker stop cce-compliance-ui
docker rm cce-compliance-ui
docker run -d \
  --name cce-compliance-ui \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  cce-compliance-ui:latest
```

### With Docker Compose

```bash
docker compose pull    # if using a registry
docker compose up -d   # recreates only changed services
```

No Caddy reload is needed when updating the container — the host Caddy config stays unchanged.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| **Blank page at localhost:3000** | SPA not built or container Caddy misconfigured | Check `docker logs cce-compliance-ui`, verify `/srv/index.html` exists in container |
| **Browser shows Caddy default page at :80** | Host Caddyfile missing site block for the UI | Add the site block from [Section 4](#4-configure-host-caddy) and reload Caddy |
| **API calls return 502 via host Caddy** | CCE Gateway not running or wrong port in Caddyfile | Verify: `curl http://localhost:8060/actuator/health` |
| **CORS errors in browser** | `VITE_API_BASE_URL` set to a different origin at build time | Rebuild with `VITE_API_BASE_URL=` (empty) so requests use relative paths through host Caddy |
| **Container exits immediately** | Port 3000 already in use | `lsof -i :3000` to find the conflict |
| **Stale UI after deploy** | Browser cached old JS bundles | Hard refresh (Ctrl+Shift+R); hashed filenames ensure new deploys get new bundles |
| **Host Caddy won't reload** | Caddyfile syntax error | Run `sudo caddy validate --config /etc/caddy/Caddyfile` to check |
