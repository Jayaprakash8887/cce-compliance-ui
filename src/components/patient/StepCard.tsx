import type { StepInstanceDto } from '../../api/types';
import StateBadge from '../common/StateBadge';
import { STATE_COLORS } from '../../utils/colors';
import { COMPLETION_COLORS } from '../../utils/colors';
import { formatDate, formatDateTime, daysSince } from '../../utils/dates';

interface StepCardProps {
  step: StepInstanceDto;
}

export default function StepCard({ step }: StepCardProps) {
  const colors = STATE_COLORS[step.state];

  return (
    <div className="relative flex items-start gap-3 pl-1">
      {/* Timeline dot */}
      <div className="z-10 mt-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <div className={`h-3 w-3 rounded-full ${colors.dot} ring-2 ring-white`} />
      </div>

      {/* Card */}
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step.dueDate && (
              <span className="text-xs text-gray-500">{formatDate(step.dueDate)}</span>
            )}
            <span className="font-medium text-gray-900">
              {step.actionId}
              {step.repeatIndex > 0 && (
                <span className="text-gray-400"> #{step.repeatIndex}</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {step.requiredBehavior && (
              <span
                className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                  step.requiredBehavior === 'must'
                    ? 'bg-red-50 text-red-600 font-bold'
                    : 'bg-gray-50 text-gray-400'
                }`}
              >
                {step.requiredBehavior}
              </span>
            )}
            <StateBadge state={step.state} />
          </div>
        </div>

        {/* State-specific content */}
        <div className="mt-2 text-sm text-gray-600">
          {step.state === 'completed' && <CompletedContent step={step} />}
          {(step.state === 'due' || step.state === 'overdue') && <ActiveContent step={step} />}
          {step.state === 'missed' && <MissedContent step={step} />}
          {step.state === 'pending' && step.dueDate && (
            <p>Due: {formatDate(step.dueDate)}</p>
          )}
          {step.state === 'skipped' && (
            <p className="line-through text-gray-400">Skipped</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletedContent({ step }: { step: StepInstanceDto }) {
  const completionColors = step.completionStatus ? COMPLETION_COLORS[step.completionStatus] : null;

  return (
    <div className="space-y-0.5">
      {step.completionStatus && completionColors && (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${completionColors.bg} ${completionColors.text}`}>
          {step.completionStatus.toUpperCase().replace('_', ' ')}
        </span>
      )}
      {step.completedAt && (
        <p>Completed: {formatDateTime(step.completedAt)}{step.completedBySource ? ` by ${step.completedBySource}` : ''}</p>
      )}
      {step.matchedEventId && (
        <p className="text-xs text-gray-400">Source event: {step.matchedEventId}</p>
      )}
    </div>
  );
}

function ActiveContent({ step }: { step: StepInstanceDto }) {
  return (
    <div className="space-y-0.5">
      {step.dueDate && <p>Due: {formatDate(step.dueDate)}</p>}
      {step.overdueDate && <p>Overdue since: {formatDate(step.overdueDate)}</p>}
      {step.missedDate && <p>Missed deadline: {formatDate(step.missedDate)}</p>}
      {step.state === 'overdue' && step.overdueDate && (
        <p className="text-amber-600 font-medium">
          ⚠ {daysSince(step.overdueDate)} days overdue
        </p>
      )}
    </div>
  );
}

function MissedContent({ step }: { step: StepInstanceDto }) {
  return (
    <div className="space-y-0.5">
      {step.dueDate && <p>Due: {formatDate(step.dueDate)}</p>}
      {step.missedDate && <p>Missed: {formatDate(step.missedDate)}</p>}
    </div>
  );
}
