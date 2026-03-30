import { useMemo } from 'react';
import type { ProtocolInstanceDto } from '../../api/types';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/dates';
import { computeComplianceRate, extractProtocolName, parseCanonicalUrl } from '../../utils/compliance';
import type { ProtocolDefinitionDto } from '../../api/types';

interface JourneyHeaderProps {
  instance: ProtocolInstanceDto;
  protocolDef?: ProtocolDefinitionDto;
}

export default function JourneyHeader({ instance, protocolDef }: JourneyHeaderProps) {
  const { version } = parseCanonicalUrl(instance.protocolCanonical);
  const name = protocolDef ? extractProtocolName(protocolDef) : instance.protocolCanonical;
  const steps = instance.steps ?? [];
  const complianceRate = useMemo(() => computeComplianceRate(steps), [steps]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Version {version} · Enrolled: {formatDate(instance.enrolledAt)}
          </p>
        </div>
        <StatusBadge status={instance.status} />
      </div>

      {/* Compliance Rate */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Compliance Rate</span>
          <span className="font-semibold text-gray-900">{complianceRate}%</span>
        </div>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${
              complianceRate >= 75 ? 'bg-green-500' : complianceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${complianceRate}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {steps.filter(s => s.state === 'completed' && (s.completionStatus === 'on_time' || s.completionStatus === 'early')).length} of{' '}
          {steps.filter(s => s.requiredBehavior === 'must').length} required steps completed on time
        </p>
      </div>
    </div>
  );
}
