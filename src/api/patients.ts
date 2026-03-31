import { apiGet } from './client';
import type { ProtocolInstanceDto, StepInstanceDto, DeviationDto, EventLogDto, Page } from './types';

function normalizeStep(s: StepInstanceDto): StepInstanceDto {
  return {
    ...s,
    state: s.state.toLowerCase() as StepInstanceDto['state'],
    completionStatus: s.completionStatus
      ? s.completionStatus.toLowerCase() as StepInstanceDto['completionStatus']
      : null,
    requiredBehavior: s.requiredBehavior
      ? s.requiredBehavior.toLowerCase() as StepInstanceDto['requiredBehavior']
      : null,
  };
}

function normalizeDeviation(d: DeviationDto): DeviationDto {
  return { ...d, deviationType: d.deviationType.toLowerCase() as DeviationDto['deviationType'] };
}

function normalizeInstance(inst: ProtocolInstanceDto): ProtocolInstanceDto {
  return {
    ...inst,
    status: inst.status.toLowerCase() as ProtocolInstanceDto['status'],
    steps: inst.steps?.map(normalizeStep) ?? null,
    deviations: inst.deviations?.map(normalizeDeviation) ?? null,
  };
}

function normalizeEvent(e: EventLogDto): EventLogDto {
  return { ...e, processingStatus: e.processingStatus.toLowerCase() as EventLogDto['processingStatus'] };
}

export async function getPatientProtocols(patientId: string): Promise<ProtocolInstanceDto[]> {
  const data = await apiGet<ProtocolInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances`,
  );
  return data.map(normalizeInstance);
}

export async function getPatientActiveProtocols(patientId: string): Promise<ProtocolInstanceDto[]> {
  const data = await apiGet<ProtocolInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/active`,
  );
  return data.map(normalizeInstance);
}

export async function getProtocolInstanceDetail(
  patientId: string,
  protocolInstanceId: string,
): Promise<ProtocolInstanceDto> {
  const data = await apiGet<ProtocolInstanceDto>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}`,
  );
  return normalizeInstance(data);
}

export async function getProtocolSteps(
  patientId: string,
  protocolInstanceId: string,
): Promise<StepInstanceDto[]> {
  const data = await apiGet<StepInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}/steps`,
  );
  return data.map(normalizeStep);
}

export async function getProtocolDeviations(
  patientId: string,
  protocolInstanceId: string,
): Promise<DeviationDto[]> {
  const data = await apiGet<DeviationDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}/deviations`,
  );
  return data.map(normalizeDeviation);
}

export async function getPatientEvents(
  patientId: string,
  page = 0,
  size = 20,
): Promise<Page<EventLogDto>> {
  const data = await apiGet<Page<EventLogDto>>(
    `/patients/${encodeURIComponent(patientId)}/events`,
    { page: String(page), size: String(size) },
  );
  return { ...data, content: data.content.map(normalizeEvent) };
}
