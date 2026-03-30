export const queryKeys = {
  protocols: {
    all: ['protocols'] as const,
    detail: (id: string) => ['protocols', id] as const,
  },
  patients: {
    protocols: (patientId: string) =>
      ['patients', patientId, 'protocols'] as const,
    protocolDetail: (patientId: string, instanceId: string) =>
      ['patients', patientId, 'protocols', instanceId] as const,
    events: (patientId: string, page: number, size: number) =>
      ['patients', patientId, 'events', { page, size }] as const,
  },
} as const;
