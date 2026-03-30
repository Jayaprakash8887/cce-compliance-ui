// ─── Protocol Definition ─────────────────────────────────────

export interface ProtocolDefinitionDto {
  id: string;
  url: string;
  version: string;
  canonical: string;
  status: 'active' | 'retired';
  loadedAt: string;
  definition: PlanDefinitionJson;
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
  requiredBehavior?: RequiredBehavior;
  trigger?: TriggerDefinition[];
  relatedAction?: RelatedAction[];
  timingTiming?: { repeat?: { count?: number; frequency?: number; period?: number; periodUnit?: string } };
  condition?: FhirExpression[];
  action?: PlanDefinitionAction[];
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
  type: string;
  codeFilter?: CodeFilter[];
  dateFilter?: unknown[];
  profile?: string[];
}

export interface CodeFilter {
  path: string;
  code?: { system?: string; code: string }[];
}

export interface RelatedAction {
  actionId: string;
  relationship: string;
  offsetDuration?: { value: number; unit: string };
}

export interface FhirExpression {
  language: string;
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
  protocolCanonical: string;
  protocolDefinitionId: string;
  status: ProtocolInstanceStatus;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  steps: StepInstanceDto[] | null;
  deviations: DeviationDto[] | null;
}

export type ProtocolInstanceStatus = 'active' | 'completed' | 'withdrawn' | 'expired';

// ─── Step Instance ───────────────────────────────────────────

export interface StepInstanceDto {
  id: string;
  protocolInstanceId: string;
  actionId: string;
  repeatIndex: number;
  state: StepState;
  dueDate: string | null;
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
  intelligenceEventId: string | null;
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
  subject: string;
  type: string;
  correlationId: string;
  eventTime: string;
  receivedAt: string;
  data: Record<string, unknown>;
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
