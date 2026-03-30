# CCE Compliance UI

A React single-page application for visualizing CCE patient journey compliance — protocol timelines, step tracking, deviation detection, and event trails.

## Tech Stack

React 18 · TypeScript · Vite · TanStack Query · Tailwind CSS · Recharts · React Router 7

## Quick Start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build → dist/
npm run test         # Run tests
```

## Docker

```bash
docker build -t cce-compliance-ui .
docker run -d -p 127.0.0.1:3000:3000 cce-compliance-ui
```

The container serves the static SPA using **Caddy**. On EC2, the host Caddy (already deployed) reverse-proxies browser traffic to the container and `/v1/*` API calls to the Compliance Service — see `deploy/caddy-site.example`.

## Environment Variables

### Build-Time (Vite)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Compliance Service URL (leave empty when host Caddy proxies) |
| `VITE_AUTH_ENABLED` | `false` | Enable OAuth |
| `VITE_POLLING_INTERVAL` | `30000` | Auto-refresh interval (ms) |

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Protocol overview, patient search |
| `/patients/:id` | Patient Overview | Protocol enrollments list |
| `/patients/:id/protocols/:id` | Patient Journey | Step timeline, deviations, events |
| `/protocols` | Protocol List | Browse protocol definitions |
| `/protocols/:id` | Protocol Detail | Actions, triggers, raw JSON |

## Documentation

- [Architecture Overview](docs/architecture-overview.md)
- [API Integration](docs/api-integration.md)
- [Pages & Wireframes](docs/pages-and-wireframes.md)
- [Developer Setup](docs/developer-setup.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Release Notes](docs/release-notes.md)
