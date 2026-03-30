import { formatDate, formatDateTime, toUtcString } from '../../utils/dates';

interface DateDisplayProps {
  iso: string;
  showTime?: boolean;
}

export default function DateDisplay({ iso, showTime = false }: DateDisplayProps) {
  const display = showTime ? formatDateTime(iso) : formatDate(iso);

  return (
    <span title={toUtcString(iso)} className="cursor-help">
      {display}
    </span>
  );
}
