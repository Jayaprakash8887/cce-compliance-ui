import type { StepInstanceDto } from '../../api/types';
import StepCard from './StepCard';
import type { PlanDefinitionAction } from '../../api/types';

interface StepTimelineProps {
  steps: StepInstanceDto[];
  upcomingActions?: PlanDefinitionAction[];
}

export default function StepTimeline({ steps, upcomingActions = [] }: StepTimelineProps) {
  const sorted = [...steps].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-4">
        {sorted.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}

        {/* Upcoming (not yet instantiated) */}
        {upcomingActions.length > 0 && (
          <>
            <div className="relative ml-1 flex items-center gap-3 py-2">
              <div className="z-10 h-5 w-5" />
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Upcoming (from protocol)
              </span>
            </div>
            {upcomingActions.map((action) => (
              <div key={action.id} className="relative flex items-start gap-3 pl-1">
                <div className="z-10 mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-gray-300" />
                </div>
                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 flex-1">
                  <p className="text-sm font-medium text-gray-400">{action.id}</p>
                  <p className="text-xs text-gray-400">Not yet instantiated</p>
                  {action.relatedAction?.[0] && (
                    <p className="text-xs text-gray-400">
                      Depends on: {action.relatedAction[0].actionId}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
