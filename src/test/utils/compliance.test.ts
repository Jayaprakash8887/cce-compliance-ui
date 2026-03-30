import { describe, it, expect } from 'vitest';
import { computeComplianceRate, groupStepsByState, parseCanonicalUrl, extractProtocolName } from '../../utils/compliance';
import type { StepInstanceDto } from '../../api/types';

function makeStep(overrides: Partial<StepInstanceDto>): StepInstanceDto {
  return {
    id: 'step-1',
    protocolInstanceId: 'pi-1',
    actionId: 'action-1',
    repeatIndex: 0,
    state: 'pending',
    dueDate: null,
    overdueDate: null,
    missedDate: null,
    completedAt: null,
    completedBySource: null,
    completionStatus: null,
    matchedEventId: null,
    requiredBehavior: 'must',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('computeComplianceRate', () => {
  it('returns 100 for empty steps', () => {
    expect(computeComplianceRate([])).toBe(100);
  });

  it('returns 100 when all required steps completed on time', () => {
    const steps = [
      makeStep({ state: 'completed', completionStatus: 'on_time', requiredBehavior: 'must' }),
      makeStep({ id: 's2', state: 'completed', completionStatus: 'early', requiredBehavior: 'must' }),
    ];
    expect(computeComplianceRate(steps)).toBe(100);
  });

  it('returns 0 when no required steps completed on time', () => {
    const steps = [
      makeStep({ state: 'completed', completionStatus: 'late', requiredBehavior: 'must' }),
      makeStep({ id: 's2', state: 'missed', requiredBehavior: 'must' }),
    ];
    expect(computeComplianceRate(steps)).toBe(0);
  });

  it('ignores optional steps', () => {
    const steps = [
      makeStep({ state: 'completed', completionStatus: 'on_time', requiredBehavior: 'must' }),
      makeStep({ id: 's2', state: 'missed', requiredBehavior: 'could' }),
    ];
    expect(computeComplianceRate(steps)).toBe(100);
  });

  it('returns 100 when all steps are optional', () => {
    const steps = [
      makeStep({ state: 'missed', requiredBehavior: 'could' }),
    ];
    expect(computeComplianceRate(steps)).toBe(100);
  });

  it('calculates mixed rate correctly', () => {
    const steps = [
      makeStep({ state: 'completed', completionStatus: 'on_time', requiredBehavior: 'must' }),
      makeStep({ id: 's2', state: 'completed', completionStatus: 'late', requiredBehavior: 'must' }),
      makeStep({ id: 's3', state: 'missed', requiredBehavior: 'must' }),
    ];
    expect(computeComplianceRate(steps)).toBe(33); // 1/3
  });
});

describe('groupStepsByState', () => {
  it('groups steps correctly', () => {
    const steps = [
      makeStep({ state: 'completed' }),
      makeStep({ id: 's2', state: 'overdue' }),
      makeStep({ id: 's3', state: 'pending' }),
    ];
    const groups = groupStepsByState(steps);
    expect(groups.completed.length).toBe(1);
    expect(groups.overdue.length).toBe(1);
    expect(groups.pending.length).toBe(1);
    expect(groups.due.length).toBe(0);
  });
});

describe('parseCanonicalUrl', () => {
  it('splits url|version', () => {
    expect(parseCanonicalUrl('http://example.org/fhir/plan|2.1')).toEqual({
      url: 'http://example.org/fhir/plan',
      version: '2.1',
    });
  });

  it('handles no version', () => {
    expect(parseCanonicalUrl('http://example.org/fhir/plan')).toEqual({
      url: 'http://example.org/fhir/plan',
      version: '',
    });
  });
});

describe('extractProtocolName', () => {
  it('uses title first', () => {
    const def = {
      id: '1', url: 'http://x', version: '1', canonical: 'x|1', status: 'active' as const, loadedAt: '',
      definition: { resourceType: 'PlanDefinition' as const, url: 'http://x', version: '1', status: 'active', action: [], title: 'My Protocol', name: 'my-protocol' },
    };
    expect(extractProtocolName(def)).toBe('My Protocol');
  });

  it('falls back to name', () => {
    const def = {
      id: '1', url: 'http://x', version: '1', canonical: 'x|1', status: 'active' as const, loadedAt: '',
      definition: { resourceType: 'PlanDefinition' as const, url: 'http://x', version: '1', status: 'active', action: [], name: 'my-protocol' },
    };
    expect(extractProtocolName(def)).toBe('my-protocol');
  });
});
