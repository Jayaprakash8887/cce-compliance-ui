import type { StepInstanceDto, StepState, ProtocolDefinitionDto, PlanDefinitionAction } from '../api/types';

export function computeComplianceRate(steps: StepInstanceDto[]): number {
  const required = steps.filter(s => s.requiredBehavior === 'must');
  if (required.length === 0) return 100;
  const onTime = required.filter(
    s => s.state === 'completed' && (s.completionStatus === 'on_time' || s.completionStatus === 'early'),
  );
  return Math.round((onTime.length / required.length) * 100);
}

export function groupStepsByState(steps: StepInstanceDto[]): Record<StepState, StepInstanceDto[]> {
  const groups: Record<StepState, StepInstanceDto[]> = {
    pending: [],
    due: [],
    overdue: [],
    missed: [],
    completed: [],
    skipped: [],
  };
  for (const step of steps) {
    groups[step.state].push(step);
  }
  return groups;
}

export function parseCanonicalUrl(canonical: string): { url: string; version: string } {
  const idx = canonical.lastIndexOf('|');
  if (idx === -1) return { url: canonical, version: '' };
  return { url: canonical.substring(0, idx), version: canonical.substring(idx + 1) };
}

export function extractProtocolName(definition: ProtocolDefinitionDto): string {
  return definition.definition.title || definition.definition.name || definition.url;
}

export function getUpcomingActions(
  definition: ProtocolDefinitionDto,
  instantiatedSteps: StepInstanceDto[],
): PlanDefinitionAction[] {
  const instantiatedActionIds = new Set(instantiatedSteps.map(s => s.actionId));
  return (definition.definition.action || []).filter(a => !instantiatedActionIds.has(a.id));
}
