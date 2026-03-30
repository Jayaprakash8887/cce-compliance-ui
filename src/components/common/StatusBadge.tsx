import type { ProtocolInstanceStatus } from '../../api/types';
import { STATUS_COLORS } from '../../utils/colors';

interface StatusBadgeProps {
  status: ProtocolInstanceStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
