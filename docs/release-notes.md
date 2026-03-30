# Release Notes

## v1.1.0 — 2026-03-30

**Code quality improvements** — bug fixes, performance optimizations, and maintainability enhancements.

### Bug Fixes

- **Fixed detail query index mismatch** in Patient Overview: when a status filter tab was active, `detailQueries[idx]` used the filtered index instead of the original instances array index, causing wrong step data to render on cards. Replaced with `Map<id, detail>` lookup.
- **Moved `document.title` assignments into `useEffect`**: all 4 pages (Dashboard, Patient Overview, Patient Journey, Protocol Detail) had `document.title = ...` as a side effect in the render body. Now properly wrapped in `useEffect` with dependencies.

### Performance

- **Memoized derived data** with `useMemo`: `activeProtocols` and `loadedToday` in DashboardPage, `filtered` instances and `detailByInstanceId` in PatientOverviewPage, `groupStepsByState()` in TimelineBar, `computeComplianceRate()` in JourneyHeader.

### Resilience

- **Safe date parsing**: All date formatters (`formatDate`, `formatDateTime`, `formatRelative`, `daysUntil`, `daysSince`, `toUtcString`) now use a `safeParse()` wrapper that returns the raw string as fallback instead of crashing on malformed ISO input from the API.
- **Retry with exponential backoff**: `usePatientProtocolDetail` polling hook now retries up to 3 times with exponential backoff (1s → 4s → 8s, capped at 30s) to handle transient network failures gracefully.
- **API client observability**: Non-JSON error responses now emit a `console.warn` with path and status instead of failing silently.

### Maintainability

- **Centralized query keys**: Added `src/api/queryKeys.ts` — a typed factory for all TanStack Query cache keys. All hooks now import from `queryKeys` instead of using scattered string literals, ensuring consistency and enabling IDE autocompletion for cache invalidation.

---

## v1.0.0 — 2026-03-30

**Initial release** of the CCE Compliance UI — a React SPA for visualizing patient compliance journeys.

### Features

#### Dashboard (`/`)
- Protocol definition summary: active count, total versions, loaded today
- Patient UPID search with direct navigation
- Demo patient quick-access chips (configurable in `src/config.ts`)
- Active protocol table with click-through to detail

#### Patient Overview (`/patients/:patientId`)
- List all protocol enrollments for a patient
- Status filter tabs: All, Active, Completed, Withdrawn
- Per-enrollment progress bar with step state breakdown
- Eager detail loading for step summaries on cards

#### Patient Journey (`/patients/:patientId/protocols/:protocolInstanceId`)
- **Demo centerpiece** — full visual step timeline
- Color-coded step cards: COMPLETED (green), DUE (blue), OVERDUE (amber), MISSED (red), PENDING (gray), SKIPPED (slate)
- Step completion details: timestamp, source system, timeliness (early/on-time/late)
- Required behavior badges (`must` / `could`)
- Deviation sidebar panel with type, days late, and detection date
- Upcoming steps from PlanDefinition (not yet instantiated) shown as dashed entries
- Compliance rate bar (percentage of required steps completed on time)
- Paginated event trail table with match status indicators
- Auto-refresh via polling (configurable, default 30s)

#### Protocol List (`/protocols`)
- Browse all loaded protocol definitions
- Cards with name, version, status, canonical URL, action count, loaded date

#### Protocol Detail (`/protocols/:protocolId`)
- Protocol header with canonical URL, version, status
- Parsed action list: triggers, timing, dependencies, tolerance, repeat config, intelligence rule count
- Collapsible raw PlanDefinition JSON viewer

### Technical

- **Stack**: React 18, TypeScript 5, Vite 6, TanStack Query 5, Tailwind CSS 4, React Router 7, Recharts 2, date-fns 4, Heroicons 2
- **API layer**: Typed fetch wrappers with `ApiError` class, all endpoints through `src/api/`
- **State management**: TanStack Query for server state, React Router for URL state, `useState` for UI state — no Redux/Zustand
- **Deployment**: Multi-stage Docker build (Node 22 → Caddy 2), ~50 MB image, deployed on EC2
- **Web server**: Container runs Caddy for SPA static serving; host Caddy (already on EC2) handles API reverse-proxying to CCE Gateway
- **Tests**: 34 passing — API client error handling, utility functions (compliance rate, dates, colors)

### Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8060` | CCE Gateway URL (build-time; empty for Docker) |
| `VITE_AUTH_ENABLED` | `false` | OAuth toggle |
| `VITE_AUTH_TOKEN` | _(empty)_ | Pre-seeded Bearer token (overrides sessionStorage) |
| `VITE_POLLING_INTERVAL` | `30000` | Auto-refresh interval (ms) |

### Known Limitations

- **Read-only** — no data mutation; events are submitted via Postman or emitter adaptors
- **No authentication UI** — demo mode uses the Gateway with OAuth disabled (`VITE_AUTH_ENABLED=false`)
- **No WebSocket** — polling-based refresh via TanStack Query
- **Dashboard aggregates** are limited to protocol definition counts (no cross-patient metrics endpoint yet)
- **English only** — no i18n support

### Deployment

- Docker container on EC2 with host Caddy as reverse proxy
- Container serves static SPA only; host Caddy routes `/v1/*` to CCE Gateway
- See [docs/deployment-guide.md](docs/deployment-guide.md) and `deploy/caddy-site.example` for full instructions
