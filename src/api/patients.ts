import { apiGet } from './client';
import type { ProtocolInstanceDto, StepInstanceDto, DeviationDto, EventLogDto, Page } from './types';

export function getPatientProtocols(patientId: string): Promise<ProtocolInstanceDto[]> {
  return apiGet<ProtocolInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances`,
  );
}

export function getPatientActiveProtocols(patientId: string): Promise<ProtocolInstanceDto[]> {
  return apiGet<ProtocolInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/active`,
  );
}

export function getProtocolInstanceDetail(
  patientId: string,
  protocolInstanceId: string,
): Promise<ProtocolInstanceDto> {
  return apiGet<ProtocolInstanceDto>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}`,
  );
}

export function getProtocolSteps(
  patientId: string,
  protocolInstanceId: string,
): Promise<StepInstanceDto[]> {
  return apiGet<StepInstanceDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}/steps`,
  );
}

export function getProtocolDeviations(
  patientId: string,
  protocolInstanceId: string,
): Promise<DeviationDto[]> {
  return apiGet<DeviationDto[]>(
    `/patients/${encodeURIComponent(patientId)}/protocol-instances/${encodeURIComponent(protocolInstanceId)}/deviations`,
  );
}

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
