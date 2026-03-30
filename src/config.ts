import type { StepState } from './api/types';

export const DEMO_PATIENTS = [
  { id: '260115-0001-7823', label: 'ANC Patient' },
  { id: '260225-0002-5501', label: 'NCD Patient' },
];

export const STEP_STATE_ORDER: StepState[] = [
  'completed',
  'due',
  'overdue',
  'missed',
  'pending',
  'skipped',
];

export const PAGE_SIZE = 20;
