import { useMemo } from 'react';
import type { StepInstanceDto } from '../../api/types';
import { STATE_COLORS } from '../../utils/colors';
import { groupStepsByState } from '../../utils/compliance';

interface TimelineBarProps {
  steps: StepInstanceDto[];
}

export default function TimelineBar({ steps }: TimelineBarProps) {
  const groups = useMemo(() => groupStepsByState(steps), [steps]);

  if (steps.length === 0) return null;

  const total = steps.length;
  const order = ['completed', 'due', 'overdue', 'missed', 'pending', 'skipped'] as const;

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        {order.map((state) => {
          const count = groups[state].length;
          if (count === 0) return null;
          return (
            <div
              key={state}
              className={STATE_COLORS[state].dot}
              style={{ width: `${(count / total) * 100}%` }}
              title={`${count} ${state}`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
        {order.map((state) => {
          const count = groups[state].length;
          if (count === 0) return null;
          return (
            <span key={state} className="flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${STATE_COLORS[state].dot}`} />
              {count} {state}
            </span>
          );
        })}
      </div>
    </div>
  );
}
