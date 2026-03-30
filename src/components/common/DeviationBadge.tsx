import type { DeviationDto } from '../../api/types';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface DeviationBadgeProps {
  deviation: DeviationDto;
}

export default function DeviationBadge({ deviation }: DeviationBadgeProps) {
  const isOverdue = deviation.deviationType === 'overdue';
  const days = isOverdue
    ? deviation.metadata?.daysOverdue
    : deviation.metadata?.daysPastMissedDate;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isOverdue ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {isOverdue ? (
        <ExclamationTriangleIcon className="h-3.5 w-3.5" />
      ) : (
        <XCircleIcon className="h-3.5 w-3.5" />
      )}
      {deviation.deviationType.toUpperCase()}
      {days != null && ` — ${days}d`}
    </span>
  );
}
