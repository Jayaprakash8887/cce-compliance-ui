import { useQuery } from '@tanstack/react-query';
import { getProtocolDefinitions, getProtocolDefinition } from '../api/protocols';
import { queryKeys } from '../api/queryKeys';

export function useProtocolDefinitions() {
  return useQuery({
    queryKey: queryKeys.protocols.all,
    queryFn: getProtocolDefinitions,
    staleTime: 60_000,
  });
}

export function useProtocolDefinition(id: string) {
  return useQuery({
    queryKey: queryKeys.protocols.detail(id),
    queryFn: () => getProtocolDefinition(id),
    enabled: !!id,
  });
}
