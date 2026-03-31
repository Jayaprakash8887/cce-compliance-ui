import { apiGet } from './client';
import type { ProtocolDefinitionDto } from './types';

function normalizeProtocol(p: ProtocolDefinitionDto): ProtocolDefinitionDto {
  return { ...p, status: p.status.toLowerCase() as ProtocolDefinitionDto['status'] };
}

export async function getProtocolDefinitions(): Promise<ProtocolDefinitionDto[]> {
  const data = await apiGet<ProtocolDefinitionDto[]>('/protocol-definitions');
  return data.map(normalizeProtocol);
}

export async function getProtocolDefinition(id: string): Promise<ProtocolDefinitionDto> {
  const data = await apiGet<ProtocolDefinitionDto>(`/protocol-definitions/${encodeURIComponent(id)}`);
  return normalizeProtocol(data);
}

export async function getProtocolDefinitionsByUrl(url: string): Promise<ProtocolDefinitionDto[]> {
  const data = await apiGet<ProtocolDefinitionDto[]>('/protocol-definitions/by-url', { url });
  return data.map(normalizeProtocol);
}

export async function getProtocolDefinitionByUrlAndVersion(
  url: string,
  version: string,
): Promise<ProtocolDefinitionDto> {
  const data = await apiGet<ProtocolDefinitionDto>('/protocol-definitions/by-url-version', { url, version });
  return normalizeProtocol(data);
}
