import { useQuery } from '@tanstack/react-query';
import { getPatientProtocols, getProtocolInstanceDetail } from '../api/patients';
import { queryKeys } from '../api/queryKeys';

const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL || 30000);

export function usePatientProtocols(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patients.protocols(patientId),
    queryFn: () => getPatientProtocols(patientId),
    enabled: !!patientId,
  });
}

export function usePatientProtocolDetail(patientId: string, protocolInstanceId: string) {
  return useQuery({
    queryKey: queryKeys.patients.protocolDetail(patientId, protocolInstanceId),
    queryFn: () => getProtocolInstanceDetail(patientId, protocolInstanceId),
    enabled: !!patientId && !!protocolInstanceId,
    refetchInterval: POLLING_INTERVAL || false,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
  });
}
