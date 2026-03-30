import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { usePatientProtocolDetail } from '../hooks/usePatientProtocols';
import { useProtocolDefinition } from '../hooks/useProtocolDefinitions';
import { getUpcomingActions } from '../utils/compliance';
import JourneyHeader from '../components/patient/JourneyHeader';
import StepTimeline from '../components/patient/StepTimeline';
import DeviationList from '../components/patient/DeviationList';
import EventTrail from '../components/patient/EventTrail';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { ApiError } from '../api/client';

export default function PatientJourneyPage() {
  const { patientId, protocolInstanceId } = useParams<{
    patientId: string;
    protocolInstanceId: string;
  }>();

  const {
    data: instance,
    isLoading,
    error,
  } = usePatientProtocolDetail(patientId!, protocolInstanceId!);

  const { data: protocolDef } = useProtocolDefinition(
    instance?.protocolDefinitionId ?? '',
  );

  useEffect(() => {
    document.title = instance
      ? `Journey — ${patientId} — CCE Compliance`
      : 'Journey — CCE Compliance';
  }, [instance, patientId]);

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <EmptyState
          message="Protocol instance not found"
          actionLabel="Back to Patient"
          actionHref={`/patients/${patientId}`}
        />
      );
    }
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Error: {error.message}
      </div>
    );
  }

  if (!instance) return null;

  const steps = instance.steps ?? [];
  const deviations = instance.deviations ?? [];
  const upcomingActions = protocolDef
    ? getUpcomingActions(protocolDef, steps)
    : [];

  return (
    <div className="space-y-6">
      <Link
        to={`/patients/${patientId}`}
        className="text-sm text-indigo-600 hover:text-indigo-800"
      >
        ← Patient {patientId}
      </Link>

      <JourneyHeader instance={instance} protocolDef={protocolDef} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Step Timeline — 2/3 width */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Step Timeline ({steps.length} steps)
            </h2>
            <StepTimeline steps={steps} upcomingActions={upcomingActions} />
          </div>
        </div>

        {/* Deviation Panel — 1/3 width */}
        <div>
          <DeviationList deviations={deviations} steps={steps} />
        </div>
      </div>

      {/* Event Trail — full width */}
      <EventTrail patientId={patientId!} />
    </div>
  );
}
