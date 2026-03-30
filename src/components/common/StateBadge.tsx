import type { StepState } from '../../api/types';
import { STATE_COLORS } from '../../utils/colors';

interface StateBadgeProps {
  state: StepState;
}

export default function StateBadge({ state }: StateBadgeProps) {
  const colors = STATE_COLORS[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {state.toUpperCase()}
    </span>
  );
}
