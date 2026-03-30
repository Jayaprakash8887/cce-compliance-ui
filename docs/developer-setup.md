# Developer Setup

> **CCE Compliance UI** — Local development environment setup guide

---

## 1. Prerequisites

| Tool | Version | Required | Purpose |
|---|---|---|---|
| **Node.js** | 22 LTS | Yes | Runtime |
| **npm** | 10.x | Yes | Package manager (ships with Node 22) |
| **Git** | 2.x | Yes | Version control |
| **Docker** | 24+ | Recommended | Run backend services |

### Backend Services Must Be Running

The Compliance UI is a **read-only** consumer of the Compliance Service REST APIs. The following backend services must be running before starting the UI:

| Service | Port | Purpose |
|---------|------|---------|
| **Collector Service** (Docker Compose) | 5433 (PostgreSQL), 9092 (Kafka) | Infrastructure + database |
| **Compliance Service** | 8080 | REST APIs consumed by UI |
| **CCE Gateway** | 8060 | API routing (UI connects here) |

Optionally, for the full event pipeline:

| Service | Port | Purpose |
|---------|------|---------|
| **OpenHIM Emitter Adaptor** | — | Submit clinical events |

---

## 2. Quick Start

### 2.1 Start Backend Infrastructure

```bash
# Start PostgreSQL (port 5433) + Kafka (port 9092) + database cce_collector
cd /path/to/cce-collector-service
docker compose up -d

# Verify
docker compose ps
```

### 2.2 Start Compliance Service

```bash
cd /path/to/cce-compliance-service
./gradlew bootRun
# Verify: curl http://localhost:8080/actuator/health
```

### 2.3 Start CCE Gateway

```bash
cd /path/to/cce-gateway
./gradlew bootRun
# Verify: curl http://localhost:8060/actuator/health
```

### 2.4 Load Protocol Definitions (Demo Data)

```bash
# Load sample protocols from the artifacts folder
cd /path/to/cce-compliance-sub_system/artifacts
bash load-protocol-definitions.sh
```

### 2.5 Start the UI

```bash
cd cce-compliance-ui

# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

Open http://localhost:3000 in your browser.

### 2.6 Submit Demo Events

Use Postman or the emitter adaptor to submit clinical events. Sample events are in:
- `artifacts/sample-kafka-events-ebuzima-visit.json`
- `artifacts/sample-kafka-events-rhie.json`

After submitting events, the UI auto-refreshes within 30 seconds (configurable) to show the updated patient journey.

---

## 3. Environment Variables

Create a `.env` file in the project root (or set in your terminal):

```bash
# .env
VITE_API_BASE_URL=http://localhost:8060   # CCE Gateway URL
VITE_AUTH_ENABLED=false                    # Demo mode: no OAuth
VITE_AUTH_TOKEN=                           # Pre-seeded Bearer token (optional, overrides sessionStorage)
VITE_POLLING_INTERVAL=30000               # Auto-refresh interval (ms), 0 to disable
```

| Variable | Default | Options | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8060` | Any URL | CCE Gateway URL. Empty string if using Vite proxy. |
| `VITE_AUTH_ENABLED` | `false` | `true` / `false` | Enable OAuth token in API requests |
| `VITE_AUTH_TOKEN` | _(empty)_ | JWT string | Pre-seeded Bearer token; falls back to `sessionStorage.access_token` if empty |
| `VITE_POLLING_INTERVAL` | `30000` | Any number (ms) | TanStack Query refetch interval. `0` disables polling. |

---

## 4. Project Initialization (New Project)

```bash
# Create Vite + React + TypeScript project
npm create vite@latest cce-compliance-ui -- --template react-ts
cd cce-compliance-ui

# Install core dependencies
npm install react-router-dom @tanstack/react-query recharts date-fns @heroicons/react

# Install Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# Install dev dependencies
npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom msw
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // Uncomment to use proxy instead of VITE_API_BASE_URL
      // '/v1': { target: 'http://localhost:8060', changeOrigin: true },
    },
  },
});
```

### Tailwind Entry

```css
/* src/index.css */
@import "tailwindcss";
```

---

## 5. Project Structure

```
cce-compliance-ui/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/                     # Typed API client
│   │   ├── client.ts
│   │   ├── patients.ts
│   │   ├── protocols.ts
│   │   ├── queryKeys.ts         # Centralized TanStack Query key factory
│   │   └── types.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── common/
│   │   │   ├── StateBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── DeviationBadge.tsx
│   │   │   ├── TimelineBar.tsx
│   │   │   ├── DateDisplay.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── patient/
│   │       ├── StepCard.tsx
│   │       ├── StepTimeline.tsx
│   │       ├── DeviationList.tsx
│   │       ├── EventTrail.tsx
│   │       └── JourneyHeader.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── PatientOverviewPage.tsx
│   │   ├── PatientJourneyPage.tsx
│   │   ├── ProtocolListPage.tsx
│   │   └── ProtocolDetailPage.tsx
│   ├── hooks/
│   │   ├── usePatientProtocols.ts
│   │   ├── useProtocolDefinitions.ts
│   │   └── usePatientEvents.ts
│   ├── utils/
│   │   ├── dates.ts
│   │   ├── compliance.ts
│   │   └── colors.ts
│   ├── config.ts               # Demo patient list, constants
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── .env                         # Environment variables
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── Caddyfile                    # Production Caddy config
├── Dockerfile                   # Multi-stage Docker build
└── README.md
```

---

## 6. Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server on port 3000 with HMR |
| `npm run build` | TypeScript check + Vite production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:ci` | Run Vitest once (CI mode) |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |

---

## 7. Docker Build

The container serves only static files. The EC2 host's Caddy handles API proxying to the Compliance Service.

### Build & Run

```bash
# Build the image
docker build -t cce-compliance-ui:latest .

# Run
docker run -d \
  --name compliance-ui \
  -p 127.0.0.1:3000:3000 \
  cce-compliance-ui:latest
```

### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static SPA
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 3000
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
```

### Container Caddyfile

The container's Caddy only serves the SPA with `try_files` fallback — no API proxying.

```caddyfile
:3000
root * /srv
try_files {path} /index.html
file_server

@static path *.js *.css *.svg *.png *.ico *.woff2
header @static Cache-Control "public, max-age=31536000, immutable"
```

API proxying (`/v1/*` → Compliance Service) is configured in the host Caddy. See `deploy/caddy-site.example`.

---

## 8. Testing

### 8.1 Test Setup

```typescript
// vitest.config.ts (or in vite.config.ts)
/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

### 8.2 Mocking API Calls with MSW

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API = 'http://localhost:8060/v1';

export const handlers = [
  http.get(`${API}/protocol-definitions`, () => {
    return HttpResponse.json([
      { id: 'pd-001', url: 'http://openphc.org/.../anc-high-risk', version: '2.1', status: 'active', ... },
    ]);
  }),

  http.get(`${API}/patients/:patientId/protocol-instances`, ({ params }) => {
    return HttpResponse.json([
      { id: 'pi-001', patientId: params.patientId, status: 'active', steps: null, deviations: null, ... },
    ]);
  }),
];
```

### 8.3 Test Categories

| Category | Tool | Purpose |
|---|---|---|
| Component tests | Vitest + Testing Library | Render StateBadge, StepCard with props |
| Hook tests | Vitest + renderHook | Test query hooks with MSW |
| Utility tests | Vitest | Test date formatters, compliance calculations, color mapping |
| E2E (future) | Playwright | Full browser tests against running backend |

---

## 9. Demo Workflow

### Recommended Demo Sequence

1. **Start infrastructure** — `docker compose up -d` (Collector Service)
2. **Start Compliance Service** — `./gradlew bootRun`
3. **Load protocols** — `bash artifacts/load-protocol-definitions.sh`
4. **Start UI** — `npm run dev`
5. **Open Dashboard** — http://localhost:3000
6. **Show Protocol Definitions** — click through to `/protocols` to show loaded protocols
7. **Submit events** via Postman / emitter adaptor — show events flowing through the system
8. **Search for patient** — enter UPID in dashboard search
9. **Show Patient Journey** — click into protocol instance, walk through:
   - Step timeline with color-coded states
   - Completed steps with source and timeliness
   - Overdue/missed steps with deviation indicators
   - Event trail showing which events matched which steps
10. **Live update** — submit another event, watch the UI update within 30 seconds
