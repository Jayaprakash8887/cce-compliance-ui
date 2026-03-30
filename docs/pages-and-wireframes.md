# UI Pages & Wireframes

> **CCE Compliance UI** — Page-by-page design reference with ASCII wireframes  
> Each page maps directly to Compliance Service API endpoints.

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Patient Overview](#2-patient-overview)
3. [Patient Journey (Demo Centerpiece)](#3-patient-journey)
4. [Protocol List](#4-protocol-list)
5. [Protocol Detail](#5-protocol-detail)
6. [Shared Components](#6-shared-components)

---

## 1. Dashboard

**Route:** `/`  
**Purpose:** Landing page — high-level compliance metrics and quick patient lookup.

### APIs Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/protocol-definitions` | Count active protocols, list names |

> **Note:** The Compliance Service does not yet expose aggregate dashboard endpoints (`/compliance-summary`, `/patients` by status). For the demo, the dashboard shows protocol definitions and provides **patient search** as the primary entry point. Aggregated metrics (compliance rate, deviation counts) are computed client-side once a patient journey is loaded.

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                            │
│  │ CCE     │   Dashboard                                                │
│  │ Logo    │                                                            │
│  ├─────────┤   ┌──────────────────────────────────────────────────────┐  │
│  │         │   │  🔍 Search Patient UPID...                    [Go]  │  │
│  │ ● Dash  │   └──────────────────────────────────────────────────────┘  │
│  │         │                                                            │
│  │ ○ Proto │   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │   cols  │   │ Active       │ │ Total        │ │ Loaded       │      │
│  │         │   │ Protocols    │ │ Versions     │ │ Today        │      │
│  │         │   │     4        │ │     7        │ │     1        │      │
│  │         │   └──────────────┘ └──────────────┘ └──────────────┘      │
│  │         │                                                            │
│  │         │   Active Protocol Definitions                              │
│  │         │   ┌────────────────────────────────────────────────────┐   │
│  │         │   │ Name                    │ Version │ Status │ Date  │   │
│  │         │   ├─────────────────────────┼─────────┼────────┼───────│   │
│  │         │   │ ANC High-Risk Monitor   │  2.1    │ ACTIVE │ Mar 15│   │
│  │         │   │ Child Immunization      │  1.0    │ ACTIVE │ Mar 10│   │
│  │         │   │ Malaria Treatment       │  1.0    │ ACTIVE │ Mar 12│   │
│  │         │   │ eBuzima Clinical Visit  │  1.0    │ ACTIVE │ Mar 20│   │
│  │         │   └────────────────────────────────────────────────────┘   │
│  │         │                                                            │
│  │         │   Quick Access — Demo Patients                             │
│  │         │   ┌────────────────────────────────────────────────────┐   │
│  │         │   │ 260115-0001-7823  │ 260225-0002-5501  │ ...       │   │
│  │         │   └────────────────────────────────────────────────────┘   │
│  └─────────┘                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Key Interactions

| Action | Behavior |
|--------|----------|
| Enter patient UPID in search → press Go | Navigate to `/patients/{patientId}` |
| Click protocol row | Navigate to `/protocols/{id}` |
| Click demo patient chip | Navigate to `/patients/{patientId}` |

### Demo Patient Chips

Configurable list of known patient UPIDs for quick demo navigation. Stored in a config constant (not API-driven):

```typescript
// src/config.ts
export const DEMO_PATIENTS = [
  { id: '260115-0001-7823', label: 'ANC Patient' },
  { id: '260225-0002-5501', label: 'NCD Patient' },
];
```

---

## 2. Patient Overview

**Route:** `/patients/:patientId`  
**Purpose:** Show all protocol enrollments for a patient. Entry point to individual journeys.

### APIs Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/patients/{patientId}/protocol-instances` | All enrollments (all statuses) |
| `GET /v1/patients/{patientId}/protocol-instances/active` | Quick filter for active |

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                            │
│  │ Sidebar │   Patient: 260115-0001-7823                                │
│  │         │   ← Back to Dashboard                                      │
│  │         │                                                            │
│  │         │   ┌─ Filter ─────────────────────────────────────────────┐  │
│  │         │   │ [All] [Active] [Completed] [Withdrawn]              │  │
│  │         │   └──────────────────────────────────────────────────────┘  │
│  │         │                                                            │
│  │         │   ┌──────────────────────────────────────────────────────┐  │
│  │         │   │ 🟢 ACTIVE                                           │  │
│  │         │   │ ANC High-Risk Monitoring v2.1                       │  │
│  │         │   │ Enrolled: 2026-03-15                                │  │
│  │         │   │                                                     │  │
│  │         │   │ Steps: ██████░░░░ 3/6                               │  │
│  │         │   │ ● 2 completed  ● 1 overdue  ○ 3 pending            │  │
│  │         │   │                                          [View →]   │  │
│  │         │   └──────────────────────────────────────────────────────┘  │
│  │         │                                                            │
│  │         │   ┌──────────────────────────────────────────────────────┐  │
│  │         │   │ 🔵 COMPLETED                                        │  │
│  │         │   │ Malaria Treatment v1.0                              │  │
│  │         │   │ Enrolled: 2026-01-20  ·  Completed: 2026-02-28     │  │
│  │         │   │                                                     │  │
│  │         │   │ Steps: ██████████ 4/4                               │  │
│  │         │   │ ● 3 on-time  ● 1 late                              │  │
│  │         │   │                                          [View →]   │  │
│  │         │   └──────────────────────────────────────────────────────┘  │
│  │         │                                                            │
│  └─────────┘                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Protocol Instance Card Details

Each card shows:

| Element | Source | Computation |
|---------|--------|------------|
| Protocol name + version | `protocolCanonical` | Parse from `url|version` format |
| Status badge | `status` | Color-coded: ACTIVE=green, COMPLETED=blue, WITHDRAWN=amber, EXPIRED=red |
| Enrolled date | `enrolledAt` | Formatted local date |
| Step progress bar | `steps[]` from detail call | Count by state |
| Step state summary | `steps[]` | Group and count: completed, overdue, pending, etc. |

> **Note:** The list endpoint (`/protocol-instances`) returns instances **without** steps/deviations. To show step summary on cards, either make the detail call for each instance (acceptable for demo with few enrollments per patient), or show minimal info and let the user click through.

### Design Decision: Eagerly Load Step Summaries

For the demo (typically 1-3 enrollments per patient), fetch the **detail** endpoint for each instance to have step data available for the progress bar. Use TanStack Query's parallel queries with centralized `queryKeys`:

```typescript
import { queryKeys } from '../api/queryKeys';

const instances = usePatientProtocols(patientId);
const details = useQueries({
  queries: (instances.data ?? []).map(inst => ({
    queryKey: queryKeys.patients.protocolDetail(patientId, inst.id),
    queryFn: () => getProtocolInstanceDetail(patientId, inst.id),
  })),
});

// Build id → detail lookup so filtered indices resolve correctly
const detailByInstanceId = useMemo(() => {
  const map = new Map();
  (instances.data ?? []).forEach((inst, idx) => {
    map.set(inst.id, details[idx]?.data);
  });
  return map;
}, [instances.data, details]);

// Usage: detailByInstanceId.get(inst.id)?.steps ?? []
```

> **Note:** The `Map` lookup avoids an index-mismatch bug when filter tabs are active — filtered indices don't correspond to the original `useQueries` array positions.

---

## 3. Patient Journey

**Route:** `/patients/:patientId/protocols/:protocolInstanceId`  
**Purpose:** **The demo centerpiece** — full visual timeline of a patient's compliance journey.

### APIs Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/patients/{patientId}/protocol-instances/{id}` | Protocol instance with `steps[]` + `deviations[]` |
| `GET /v1/patients/{patientId}/events?page=0&size=20` | Paginated clinical event trail |
| `GET /v1/protocol-definitions/{protocolDefinitionId}` | Full PlanDefinition for "upcoming" steps |

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                                  │
│ │ Sidebar │  ← Patient 260115-0001-7823 / ANC High-Risk v2.1               │
│ │         │                                                                  │
│ │         │  ┌─ Journey Header ──────────────────────────────────────────┐   │
│ │         │  │ ANC High-Risk Monitoring                      🟢 ACTIVE  │   │
│ │         │  │ Version 2.1  ·  Enrolled: Mar 15, 2026                   │   │
│ │         │  │                                                          │   │
│ │         │  │ Compliance Rate                                          │   │
│ │         │  │ ████████░░░░░░░░░░░░ 50% (2 of 4 completed on time)     │   │
│ │         │  └──────────────────────────────────────────────────────────┘   │
│ │         │                                                                  │
│ │         │  ┌─ Step Timeline ──────────────────┐  ┌─ Deviations ────────┐  │
│ │         │  │                                  │  │                     │  │
│ │         │  │  ● Mar 15  ANC Visit 1           │  │ ⚠ OVERDUE          │  │
│ │         │  │    🟢 COMPLETED (EARLY)          │  │ Lab Test            │  │
│ │         │  │    Completed: Mar 18 by ebuzima  │  │ 3 days overdue     │  │
│ │         │  │    Source event: evt-001          │  │ Detected: Mar 28   │  │
│ │         │  │                                  │  │                     │  │
│ │         │  │  ● Mar 20  Lab Test              │  │ 🔴 MISSED          │  │
│ │         │  │    🟢 COMPLETED (ON_TIME)        │  │ ANC Visit 3        │  │
│ │         │  │    Completed: Mar 22 by rhie     │  │ Missed: Mar 30     │  │
│ │         │  │                                  │  │ Detected: Mar 30   │  │
│ │         │  │  ● Mar 25  ANC Visit 2           │  │                     │  │
│ │         │  │    🟠 OVERDUE                    │  └─────────────────────┘  │
│ │         │  │    Due: Mar 25                   │                           │
│ │         │  │    Overdue since: Mar 28         │                           │
│ │         │  │    Missed deadline: Apr 1        │                           │
│ │         │  │    ⚠ 3 days overdue              │                           │
│ │         │  │                                  │                           │
│ │         │  │  ● Mar 30  ANC Visit 3           │                           │
│ │         │  │    🔴 MISSED                     │                           │
│ │         │  │    Due: Mar 28                   │                           │
│ │         │  │    Required: must                │                           │
│ │         │  │                                  │                           │
│ │         │  │  ┄┄┄ Upcoming (from protocol) ┄┄ │                           │
│ │         │  │  ○ ANC Visit 4                   │                           │
│ │         │  │    Not yet instantiated          │                           │
│ │         │  │  ○ Monthly Checkup               │                           │
│ │         │  │    Not yet instantiated          │                           │
│ │         │  │                                  │                           │
│ │         │  └──────────────────────────────────┘                           │
│ │         │                                                                  │
│ │         │  ┌─ Event Trail ─────────────────────────────────────────────┐   │
│ │         │  │ Time            │ Source   │ Type        │ Action  │ Match│   │
│ │         │  ├─────────────────┼──────────┼─────────────┼─────────┼──────│   │
│ │         │  │ Mar 18 10:30    │ ebuzima  │ Encounter   │ visit-1 │ ✓    │   │
│ │         │  │ Mar 22 14:15    │ rhie     │ Observation │ lab-1   │ ✓    │   │
│ │         │  │ Mar 25 09:00    │ ebuzima  │ Encounter   │ —       │ ✗    │   │
│ │         │  ├─────────────────┴──────────┴─────────────┴─────────┴──────│   │
│ │         │  │                    ◀ 1 of 2 ▶                            │   │
│ │         │  └──────────────────────────────────────────────────────────┘   │
│ │         │                                                                  │
│ └─────────┘                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Step Card Anatomy

Each `StepCard` renders differently based on state:

#### Completed Step

```
● {dueDate}  {actionId} (repeat #{repeatIndex} if > 0)
  🟢 COMPLETED ({completionStatus})                    {requiredBehavior}
  Completed: {completedAt} by {completedBySource}
  Source event: {matchedEventId}
```

#### Active Step (PENDING / DUE / OVERDUE)

```
● {dueDate}  {actionId}
  🟠 OVERDUE                                           {requiredBehavior}
  Due: {dueDate}
  Overdue since: {overdueDate}
  Missed deadline: {missedDate}
  ⚠ {daysPastDue} days overdue                         ← computed client-side
```

#### Missed Step

```
● {dueDate}  {actionId}
  🔴 MISSED                                            {requiredBehavior}
  Due: {dueDate}
  Required: {requiredBehavior}
```

#### Upcoming Step (from PlanDefinition, not yet instantiated)

```
○ {actionId}
  Not yet instantiated
  Dependencies: {relatedAction references}
```

### "Upcoming" Steps from PlanDefinition

The API only returns instantiated steps. To show the full protocol blueprint, the page also fetches the protocol definition and computes:

```typescript
const allDefinedActions = protocolDefinition.definition.action.map(a => a.id);
const instantiatedActionIds = new Set(steps.map(s => s.actionId));
const upcomingActions = allDefinedActions.filter(id => !instantiatedActionIds.has(id));
```

These render at the bottom of the timeline as muted/dashed entries.

### Deviation Panel Details

| Field | Source |
|-------|--------|
| Deviation type badge | `deviation.deviationType` — OVERDUE (amber) or MISSED (red) |
| Step name | Join `deviation.stepInstanceId` → `step.actionId` |
| Days late | `deviation.metadata.daysOverdue` or `metadata.daysPastMissedDate` |
| Detected at | `deviation.detectedAt` |

### Compliance Rate Computation

```typescript
function computeComplianceRate(steps: StepInstanceDto[]): number {
  const required = steps.filter(s => s.requiredBehavior === 'must');
  if (required.length === 0) return 100;
  const onTime = required.filter(s =>
    s.state === 'completed' && (s.completionStatus === 'on_time' || s.completionStatus === 'early')
  );
  return Math.round((onTime.length / required.length) * 100);
}
```

---

## 4. Protocol List

**Route:** `/protocols`  
**Purpose:** Browse all loaded protocol definitions.

### API Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/protocol-definitions` | All active protocol definitions |

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                              │
│ │ Sidebar │   Protocol Definitions                                       │
│ │         │                                                              │
│ │         │   ┌──────────────────────────────────────────────────────┐   │
│ │         │   │ 🟢 ANC High-Risk Monitoring                        │   │
│ │         │   │ Version: 2.1  ·  Status: ACTIVE                    │   │
│ │         │   │ URL: http://openphc.org/fhir/.../anc-high-risk     │   │
│ │         │   │ Actions: 6  ·  Loaded: Mar 15, 2026                │   │
│ │         │   │                                         [View →]   │   │
│ │         │   └──────────────────────────────────────────────────────┘   │
│ │         │                                                              │
│ │         │   ┌──────────────────────────────────────────────────────┐   │
│ │         │   │ 🟢 Child Immunization Schedule                     │   │
│ │         │   │ Version: 1.0  ·  Status: ACTIVE                    │   │
│ │         │   │ URL: http://openphc.org/fhir/.../child-immuniz...  │   │
│ │         │   │ Actions: 8  ·  Loaded: Mar 10, 2026                │   │
│ │         │   │                                         [View →]   │   │
│ │         │   └──────────────────────────────────────────────────────┘   │
│ │         │                                                              │
│ └─────────┘                                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Protocol Card Data

| Element | Source |
|---------|--------|
| Name | Extracted from `definition.title` or `definition.name` in PlanDefinition JSONB |
| Version | `version` field |
| Status | `status` — ACTIVE (green), RETIRED (gray) |
| URL | `url` field (truncated with tooltip) |
| Action count | `definition.action.length` |
| Loaded date | `loadedAt` |

---

## 5. Protocol Detail

**Route:** `/protocols/:protocolId`  
**Purpose:** View protocol structure — all actions, triggers, timing, and intelligence rules.

### API Used

| Endpoint | Purpose |
|----------|---------|
| `GET /v1/protocol-definitions/{id}` | Full protocol with PlanDefinition JSONB |

### Wireframe

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐                                                              │
│ │ Sidebar │   ← Back to Protocols                                        │
│ │         │                                                              │
│ │         │   ANC High-Risk Monitoring v2.1               🟢 ACTIVE     │
│ │         │   http://openphc.org/fhir/PlanDefinition/anc-high-risk      │
│ │         │   Loaded: Mar 15, 2026                                       │
│ │         │                                                              │
│ │         │   ┌─ Protocol Actions ───────────────────────────────────┐   │
│ │         │   │                                                      │   │
│ │         │   │  1. anc-enrollment                                   │   │
│ │         │   │     Trigger: data-added (Encounter)                  │   │
│ │         │   │     Code filters: type=anc-visit, class=AMB          │   │
│ │         │   │     Required: must                                   │   │
│ │         │   │     Timing: —                                        │   │
│ │         │   │                                                      │   │
│ │         │   │  2. anc-visit-1                                      │   │
│ │         │   │     Trigger: data-added (Encounter)                  │   │
│ │         │   │     Code filters: type=anc-visit, serviceType=...    │   │
│ │         │   │     Required: must                                   │   │
│ │         │   │     Timing: after anc-enrollment + 14 days           │   │
│ │         │   │     Tolerance: 7 days                                │   │
│ │         │   │     Intelligence rules: 2                            │   │
│ │         │   │       ├─ overdue-alert (severity: medium)            │   │
│ │         │   │       └─ missed-escalation (severity: high)          │   │
│ │         │   │                                                      │   │
│ │         │   │  3. monthly-checkup (repeating × 6)                  │   │
│ │         │   │     Trigger: data-added (Encounter)                  │   │
│ │         │   │     Required: could                                  │   │
│ │         │   │     Timing: every 30 days after anc-visit-1          │   │
│ │         │   │                                                      │   │
│ │         │   └──────────────────────────────────────────────────────┘   │
│ │         │                                                              │
│ │         │   ┌─ Raw PlanDefinition JSON ─────── [Expand / Collapse] ┐  │
│ │         │   │ {                                                     │  │
│ │         │   │   "resourceType": "PlanDefinition",                  │  │
│ │         │   │   "url": "http://openphc.org/...",                   │  │
│ │         │   │   ...                                                │  │
│ │         │   └──────────────────────────────────────────────────────┘  │
│ │         │                                                              │
│ └─────────┘                                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Action Card Parsing

Each action card is parsed from `definition.action[]` in the PlanDefinition JSONB:

| Element | PlanDefinition Path | Display |
|---------|-------------------|---------|
| Action ID | `action.id` | Title |
| Trigger mode | `action.trigger[0].type` | "data-added" or "named-event" |
| Resource type | `action.trigger[0].data[0].type` | e.g., "Encounter" |
| Code filters | `action.trigger[0].data[0].codeFilter[]` | path=code pairs |
| Required | `action.requiredBehavior` | "must" (bold) or "could" (muted) |
| Timing | `action.relatedAction[0]` | "after {actionId} + {offset}" |
| Tolerance | Extension `tolerance-days` | "{n} days" |
| Repeat | `action.timingTiming.repeat` | "every {period} {periodUnit} × {count}" |
| Intelligence rules | Nested `action.action[]` with conditions | Count + summary |

---

## 6. Shared Components

### StateBadge

Renders a colored pill for step states:

```
┌─────────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐
│ 🟢 COMPLETED │  │ 🟠 OVERDUE │  │ 🔵 DUE    │  │ 🔴 MISSED │
└─────────────┘  └──────────┘  └───────────┘  └──────────┘
```

### TimelineBar

Horizontal progress bar showing step completion:

```
████████████░░░░░░░░░░ 50%
● 3 completed  ● 1 overdue  ○ 2 pending
```

Colors per segment: green (completed), amber (overdue), red (missed), gray (pending), blue (due), slate (skipped).

### DeviationBadge

```
⚠ OVERDUE — 3 days        🔴 MISSED — 0 days past deadline
```

### DateDisplay

Shows local time with UTC on hover:

```
Mar 25, 2026 10:30 AM       ← visible
2026-03-25T10:30:00Z         ← tooltip
```

### EmptyState

Used when patient has no enrollments, protocol has no actions, etc:

```
┌──────────────────────────────┐
│                              │
│     📋 No enrollments found  │
│                              │
│  This patient has no active  │
│  protocol enrollments.       │
│                              │
│  [← Back to Dashboard]       │
│                              │
└──────────────────────────────┘
```
