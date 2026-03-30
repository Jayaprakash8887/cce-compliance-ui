import { apiGet } from './client';
import type { ProtocolDefinitionDto } from './types';

export function getProtocolDefinitions(): Promise<ProtocolDefinitionDto[]> {
  return apiGet<ProtocolDefinitionDto[]>('/protocol-definitions');
}

export function getProtocolDefinition(id: string): Promise<ProtocolDefinitionDto> {
  return apiGet<ProtocolDefinitionDto>(`/protocol-definitions/${encodeURIComponent(id)}`);
}

export function getProtocolDefinitionsByUrl(url: string): Promise<ProtocolDefinitionDto[]> {
  return apiGet<ProtocolDefinitionDto[]>('/protocol-definitions/by-url', { url });
}

export function getProtocolDefinitionByUrlAndVersion(
  url: string,
  version: string,
): Promise<ProtocolDefinitionDto> {
  return apiGet<ProtocolDefinitionDto>('/protocol-definitions/by-url-version', { url, version });
}
