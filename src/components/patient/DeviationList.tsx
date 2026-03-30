import type { DeviationDto, StepInstanceDto } from '../../api/types';
import DeviationBadge from '../common/DeviationBadge';
import { formatDate } from '../../utils/dates';

interface DeviationListProps {
  deviations: DeviationDto[];
  steps: StepInstanceDto[];
}

export default function DeviationList({ deviations, steps }: DeviationListProps) {
  if (deviations.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Deviations</h2>
        <p className="text-sm text-gray-500">No deviations detected</p>
      </div>
    );
  }

  const stepMap = new Map(steps.map(s => [s.id, s]));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        Deviations ({deviations.length})
      </h2>
      <div className="space-y-3">
        {deviations.map((d) => {
          const step = stepMap.get(d.stepInstanceId);
          return (
            <div key={d.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <DeviationBadge deviation={d} />
              <p className="mt-1 text-sm font-medium text-gray-700">
                {step?.actionId ?? d.stepInstanceId}
              </p>
              {d.metadata?.daysOverdue != null && (
                <p className="text-xs text-gray-500">{d.metadata.daysOverdue} days overdue</p>
              )}
              {d.metadata?.daysPastMissedDate != null && (
                <p className="text-xs text-gray-500">{d.metadata.daysPastMissedDate} days past missed date</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Detected: {formatDate(d.detectedAt)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
