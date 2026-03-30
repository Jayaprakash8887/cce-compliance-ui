import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPatientEvents } from '../api/patients';
import { queryKeys } from '../api/queryKeys';

export function usePatientEvents(patientId: string, page: number, size = 20) {
  return useQuery({
    queryKey: queryKeys.patients.events(patientId, page, size),
    queryFn: () => getPatientEvents(patientId, page, size),
    enabled: !!patientId,
    placeholderData: keepPreviousData,
  });
}
