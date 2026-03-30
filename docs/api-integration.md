# API Integration Reference

> **CCE Compliance UI** — Complete mapping of UI features to Compliance Service APIs  
> All endpoints are consumed from the Compliance Service (`port 8080`) or via the CCE Gateway (`port 8060`).

---

## Table of Contents

1. [API Client Configuration](#1-api-client-configuration)
2. [TypeScript Type Definitions](#2-typescript-type-definitions)
3. [Endpoint Reference](#3-endpoint-reference)
4. [TanStack Query Hooks](#4-tanstack-query-hooks)
5. [Error Handling](#5-error-handling)
6. [CORS Configuration](#6-cors-configuration)

---

## 1. API Client Configuration

### Base Client

```typescript
// src/api/client.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ErrorResponse,
  ) {
    super(body.message);
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/v1${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers: Record<string, string> = { 'Accept': 'application/json' };

  // Add OAuth token if auth is enabled (env var or sessionStorage fallback)
  if (import.meta.env.VITE_AUTH_ENABLED === 'true') {
    const token = import.meta.env.VITE_AUTH_TOKEN || sessionStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), { headers });

  if (!res.ok) {
    const body = await res.json().catch(() => {
      console.warn(`[api] Non-JSON error response from ${path}: ${res.status} ${res.statusText}`);
      return {
        status: res.status,
        error: res.statusText,
        message: `HTTP ${res.status}`,
        path: path,
        timestamp: new Date().toISOString(),
        fieldErrors: null,
      };
    });
    throw new ApiError(res.status, body);
  }

  return res.json();
}
```

---

## 2. TypeScript Type Definitions

```typescript
// src/api/types.ts

// ─── Protocol Definition ─────────────────────────────────────

export interface ProtocolDefinitionDto {
  id: string;                    // UUID
  url: string;                   // FHIR canonical URL
  version: string;               // Semantic version (e.g., "2.1")
  canonical: string;             // "url|version"
  status: 'active' | 'retired';
  loadedAt: string;              // ISO 8601
  definition: PlanDefinitionJson; // Full FHIR PlanDefinition JSONB
}

export interface PlanDefinitionJson {
  resourceType: 'PlanDefinition';
  url: string;
  version: string;
  title?: string;
  name?: string;
  status: string;
  action: PlanDefinitionAction[];
  [key: string]: unknown;
}

export interface PlanDefinitionAction {
  id: string;
  title?: string;
  description?: string;
  requiredBehavior?: 'must' | 'could' | 'must-unless-documented';
  trigger?: TriggerDefinition[];
  relatedAction?: RelatedAction[];
  timingTiming?: { repeat?: { count?: number; frequency?: number; period?: number; periodUnit?: string } };
  condition?: FhirExpression[];
  action?: PlanDefinitionAction[]; // Nested intelligence rules
  definitionCanonical?: string;
  extension?: FhirExtension[];
  [key: string]: unknown;
}

export interface TriggerDefinition {
  type: 'data-added' | 'named-event';
  name?: string;
  data?: DataRequirement[];
  condition?: FhirExpression;
}

export interface DataRequirement {
  type: string;                  // FHIR resource type (e.g., "Encounter")
  codeFilter?: CodeFilter[];
  dateFilter?: unknown[];
  profile?: string[];
}

export interface CodeFilter {
  path: string;                  // e.g., "type", "status", "class"
  code?: { system?: string; code: string }[];
}

export interface RelatedAction {
  actionId: string;
  relationship: string;           // "after-start", "after-end"
  offsetDuration?: { value: number; unit: string };
}

export interface FhirExpression {
  language: string;               // "text/jsonlogic" | "text/fhirpath"
  expression: string;
}

export interface FhirExtension {
  url: string;
  valueInteger?: number;
  valueCode?: string;
  valueString?: string;
}

// ─── Protocol Instance ───────────────────────────────────────

export interface ProtocolInstanceDto {
  id: string;
  patientId: string;
  protocolCanonical: string;       // "url|version"
  protocolDefinitionId: string;
  status: ProtocolInstanceStatus;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  steps: StepInstanceDto[] | null;       // null in list views; populated in detail
  deviations: DeviationDto[] | null;     // null in list views; populated in detail
}

export type ProtocolInstanceStatus = 'active' | 'completed' | 'withdrawn' | 'expired';

// ─── Step Instance ───────────────────────────────────────────

export interface StepInstanceDto {
  id: string;
  protocolInstanceId: string;
  actionId: string;                // PlanDefinition action.id (e.g., "anc-visit-1")
  repeatIndex: number;             // 0 for non-repeating; 1, 2, 3... for repeating
  state: StepState;
  dueDate: string | null;          // null for event-triggered steps
  overdueDate: string | null;
  missedDate: string | null;
  completedAt: string | null;
  completedBySource: string | null;
  completionStatus: CompletionStatus | null;
  matchedEventId: string | null;
  requiredBehavior: RequiredBehavior | null;
  createdAt: string;
  updatedAt: string;
}

export type StepState = 'pending' | 'due' | 'overdue' | 'missed' | 'completed' | 'skipped';
export type CompletionStatus = 'early' | 'on_time' | 'late';
export type RequiredBehavior = 'must' | 'could' | 'must-unless-documented';

// ─── Deviation ───────────────────────────────────────────────

export interface DeviationDto {
  id: string;
  protocolInstanceId: string;
  stepInstanceId: string;
  deviationType: 'overdue' | 'missed';
  detectedAt: string;
  intelligenceEventId: string | null;  // null in 1.0.0
  metadata: DeviationMetadata | null;
}

export interface DeviationMetadata {
  daysOverdue?: number;
  daysPastMissedDate?: number;
}

// ─── Event Log ───────────────────────────────────────────────

export interface EventLogDto {
  id: string;
  cloudeventsId: string;
  source: string;
  sourceEventId: string | null;
  subject: string;                 // Patient UPID
  type: string;                    // CloudEvents type
  correlationId: string;
  eventTime: string;
  receivedAt: string;
  data: Record<string, unknown>;   // FHIR resource or JSON payload
  actionId: string | null;
  facilityId: string | null;
  processingStatus: 'matched' | 'zero_match' | 'duplicate';
  protocolInstanceId: string | null;
  protocolDefinitionId: string | null;
  matchedStepInstanceId: string | null;
}

// ─── Paginated Response (Spring Data Page) ───────────────────

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ─── Error Response ──────────────────────────────────────────

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  fieldErrors: { field: string; message: string }[] | null;
}
```

---

## 3. Endpoint Reference

### 3.1 Protocol Definitions

```typescript
// src/api/protocols.ts
import { apiGet } from './client';
import type { ProtocolDefinitionDto } from './types';

/** List all active protocol definitions */
export function getProtocolDefinitions(): Promise<ProtocolDefinitionDto[]> {
  return apiGet<ProtocolDefinitionDto[]>('/protocol-definitions');
}

/** Get a single protocol definition by ID */
export function getProtocolDefinition(id: string): Promise<ProtocolDefinitionDto> {
  return apiGet<ProtocolDefinitionDto>(`/protocol-definitions/${encodeURIComponent(id)}`);
}

/** Get protocol definitions by canonical URL (all versions) */
export function getProtocolDefinitionsByUrl(url: string): Promise<ProtocolDefinitionDto[]> {
  return apiGet<ProtocolDefinitionDto[]>('/protocol-definitions/by-url', { url });
}

/** Get protocol definition by URL and version */
export function getProtocolDefinitionByUrlAndVersion(
  url: string,
  version: string,
): Promise<ProtocolDefinitionDto> {
  return apiGet<ProtocolDefinitionDto>('/protocol-definitions/by-url-version', { url, version });
}
```

### 3.2 Patient Tracking

```typescript
// src/api/patients.ts
import { apiGet } from './client';
import type { ProtocolInstanceDto, StepInstanceDto, DeviationDto, EventLogDto, Page } from './types';

/** List ALL protocol instances for a patient (no steps/deviations) */
export function getPatientProtocols(patientId: string): Promise<ProtocolInstanceDto[]> {
  return apiGet<ProtocolInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances`,
  );
}

/** List ACTIVE protocol instances only */
export function getPatientActiveProtocols(patientId: string): Promise<ProtocolInstanceDto[]> {
  return apiGet<ProtocolInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/active`,
  );
}

/** Get protocol instance detail (includes steps[] + deviations[]) */
export function getProtocolInstanceDetail(
  patientId: string,
  protocolInstanceId: string,
): Promise<ProtocolInstanceDto> {
  return apiGet<ProtocolInstanceDto>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}`,
  );
}

/** List step instances for a protocol instance */
export function getProtocolSteps(
  patientId: string,
  protocolInstanceId: string,
): Promise<StepInstanceDto[]> {
  return apiGet<StepInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}/steps`,
  );
}

/** List deviations for a protocol instance */
export function getProtocolDeviations(
  patientId: string,
  protocolInstanceId: string,
): Promise<DeviationDto[]> {
  return apiGet<DeviationDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}/deviations`,
  );
}

/** Get paginated event log for a patient */
export function getPatientEvents(
  patientId: string,
  page = 0,
  size = 20,
): Promise<Page<EventLogDto>> {
  return apiGet<Page<EventLogDto>>(
    `/patients/${encodeURIComponent(patientId)}/events`,
    { page: String(page), size: String(size) },
  );
}
```

---

## 4. TanStack Query Hooks

### 4.1 Protocol Definitions

```typescript
// src/hooks/useProtocolDefinitions.ts
import { useQuery } from '@tanstack/react-query';
import { getProtocolDefinitions, getProtocolDefinition } from '../api/protocols';
import { queryKeys } from '../api/queryKeys';

export function useProtocolDefinitions() {
  return useQuery({
    queryKey: queryKeys.protocols.all,
    queryFn: getProtocolDefinitions,
    staleTime: 60_000, // protocols rarely change during demo
  });
}

export function useProtocolDefinition(id: string) {
  return useQuery({
    queryKey: queryKeys.protocols.detail(id),
    queryFn: () => getProtocolDefinition(id),
    enabled: !!id,
  });
}
```

### 4.2 Patient Protocols

```typescript
// src/hooks/usePatientProtocols.ts
import { useQuery } from '@tanstack/react-query';
import { getPatientProtocols, getProtocolInstanceDetail } from '../api/patients';
import { queryKeys } from '../api/queryKeys';

const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL || 30000);

export function usePatientProtocols(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patients.protocols(patientId),
    queryFn: () => getPatientProtocols(patientId),
    enabled: !!patientId,
  });
}

export function usePatientProtocolDetail(patientId: string, protocolInstanceId: string) {
  return useQuery({
    queryKey: queryKeys.patients.protocolDetail(patientId, protocolInstanceId),
    queryFn: () => getProtocolInstanceDetail(patientId, protocolInstanceId),
    enabled: !!patientId && !!protocolInstanceId,
    refetchInterval: POLLING_INTERVAL || false, // live polling for demos
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000), // exponential backoff
  });
}
```

### 4.3 Patient Events

```typescript
// src/hooks/usePatientEvents.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPatientEvents } from '../api/patients';
import { queryKeys } from '../api/queryKeys';

export function usePatientEvents(patientId: string, page: number, size = 20) {
  return useQuery({
    queryKey: queryKeys.patients.events(patientId, page, size),
    queryFn: () => getPatientEvents(patientId, page, size),
    enabled: !!patientId,
    placeholderData: keepPreviousData, // smooth pagination
  });
}
```

---

## 5. Error Handling

### API Error Mapping to UI

| HTTP Status | Scenario | UI Behavior |
|:-----------:|----------|-------------|
| `200` | Success | Render data |
| `404` | Patient or protocol instance not found | Show EmptyState component: "Patient not found — check the UPID" |
| `400` | Bad request (shouldn't happen from UI) | Show error banner |
| `500` | Server error | Show error banner with retry button |
| Network error | Service unreachable | Show "Cannot connect to Compliance Service" with URL hint |

### TanStack Query Error Handling

```typescript
// In page component
const { data, isLoading, error } = usePatientProtocolDetail(patientId, protocolInstanceId);

if (isLoading) return <LoadingSpinner />;
if (error instanceof ApiError && error.status === 404) return <EmptyState message="Protocol not found" />;
if (error) return <ErrorBanner message={error.message} onRetry={() => queryClient.invalidateQueries()} />;
```

---

## 6. CORS Configuration

For demo mode (UI on port 3000 → Compliance Service on port 8080), the Compliance Service must allow CORS from `localhost:3000`.

### Option A: Compliance Service CORS Config (Recommended for Demo)

Add to Compliance Service `application.yml`:

```yaml
cce:
  cors:
    allowed-origins: "http://localhost:3000"
    allowed-methods: "GET"
    allowed-headers: "*"
```

### Option B: Vite Dev Server Proxy (No CORS needed)

Configure Vite to proxy API calls:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

With the proxy, set `VITE_API_BASE_URL=` (empty) so the UI calls relative paths like `/v1/protocol-definitions`, which Vite proxies to the Compliance Service.

### Option C: Production (Host Caddy Reverse Proxy)

In Docker deployment on EC2, the host Caddy (already deployed) reverse-proxies `/v1/*` to the Compliance Service and everything else to the UI container. No CORS needed. See `deploy/caddy-site.example` for the host Caddy configuration.
