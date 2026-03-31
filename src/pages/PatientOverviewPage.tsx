import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { usePatientProtocols } from '../hooks/usePatientProtocols';
import { getProtocolInstanceDetail } from '../api/patients';
import { queryKeys } from '../api/queryKeys';
import { parseCanonicalUrl } from '../utils/compliance';
import { formatDate } from '../utils/dates';
import StatusBadge from '../components/common/StatusBadge';
import TimelineBar from '../components/common/TimelineBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { ApiError } from '../api/client';
import type { ProtocolInstanceStatus } from '../api/types';

const FILTER_TABS: { label: string; value: ProtocolInstanceStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Withdrawn', value: 'withdrawn' },
];

export default function PatientOverviewPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [filter, setFilter] = useState<ProtocolInstanceStatus | 'all'>('all');
  const navigate = useNavigate();
  const { data: instances, isLoading, error } = usePatientProtocols(patientId!);

  // Eagerly fetch detail for each instance to get step data
  const detailQueries = useQueries({
    queries: (instances ?? []).map((inst) => ({
      queryKey: queryKeys.patients.protocolDetail(patientId!, inst.id),
      queryFn: () => getProtocolInstanceDetail(patientId!, inst.id),
    })),
  });

  // Build id → detail lookup so filtered indices work correctly
  const detailByInstanceId = useMemo(() => {
    const map = new Map<string, typeof detailQueries[number]['data']>();
    (instances ?? []).forEach((inst, idx) => {
      map.set(inst.id, detailQueries[idx]?.data);
    });
    return map;
  }, [instances, detailQueries]);

  useEffect(() => { document.title = `Patient ${patientId} — CCE Compliance`; }, [patientId]);

  const filtered = useMemo(
    () => filter === 'all' ? instances : instances?.filter(i => i.status === filter),
    [instances, filter],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return <EmptyState message="Patient not found — check the UPID" actionLabel="Back to Dashboard" actionHref="/" />;
    }
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-800">
          ← Back to Dashboard
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">
          Patient: {patientId}
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Protocol Instance Cards */}
      {!filtered || filtered.length === 0 ? (
        <EmptyState message="No protocol enrollments found for this patient" />
      ) : (
        <div className="space-y-4">
          {filtered.map((inst) => {
            const detail = detailByInstanceId.get(inst.id);
            const steps = detail?.steps ?? [];
            const { url, version } = parseCanonicalUrl(inst.protocolCanonical);

            return (
              <div
                key={inst.id}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                onClick={() => navigate(`/patients/${patientId}/protocols/${inst.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <StatusBadge status={inst.status} />
                    <h3 className="mt-1 font-medium text-gray-900">
                      {url.split('/').pop() ?? url} v{version}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Enrolled: {formatDate(inst.enrolledAt)}
                    </p>
                  </div>
                  <span className="text-sm text-indigo-600">View →</span>
                </div>

                {steps.length > 0 && (
                  <div className="mt-3">
                    <TimelineBar steps={steps} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
