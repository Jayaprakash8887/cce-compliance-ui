import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProtocolDefinition } from '../hooks/useProtocolDefinitions';
import { extractProtocolName } from '../utils/compliance';
import { formatDate } from '../utils/dates';
import type { PlanDefinitionAction } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function ProtocolDetailPage() {
  const { protocolId } = useParams<{ protocolId: string }>();
  const { data: protocol, isLoading, error } = useProtocolDefinition(protocolId!);
  const [jsonOpen, setJsonOpen] = useState(false);

  useEffect(() => {
    document.title = protocol
      ? `${extractProtocolName(protocol)} — CCE Compliance`
      : 'Protocol — CCE Compliance';
  }, [protocol]);

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return <EmptyState message="Protocol not found" actionLabel="Back to Protocols" actionHref="/protocols" />;
  }
  if (!protocol) return null;

  const actions = protocol.definition.action ?? [];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/protocols" className="text-sm text-indigo-600 hover:text-indigo-800">
        ← Back to Protocols
      </Link>

      {/* Protocol Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {extractProtocolName(protocol)} v{protocol.version}
            </h1>
            <p className="mt-1 text-sm text-gray-500 break-all">{protocol.url}</p>
            <p className="mt-1 text-sm text-gray-500">Loaded: {formatDate(protocol.loadedAt)}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              protocol.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {protocol.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Protocol Actions */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Protocol Actions ({actions.length})</h2>
        </div>
        {actions.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No actions defined</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {actions.map((action, idx) => (
              <ActionCard key={action.id} action={action} index={idx + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Raw JSON */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <button
          onClick={() => setJsonOpen(!jsonOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <h2 className="text-sm font-semibold text-gray-900">Raw PlanDefinition JSON</h2>
          {jsonOpen ? (
            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {jsonOpen && (
          <div className="border-t border-gray-200 p-4">
            <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
              {JSON.stringify(protocol.definition, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionCard({ action, index }: { action: PlanDefinitionAction; index: number }) {
  const trigger = action.trigger?.[0];
  const triggerMode = trigger?.type ?? '—';
  const resourceType = trigger?.data?.[0]?.type;
  const codeFilters = trigger?.data?.[0]?.codeFilter ?? [];
  const relatedAction = action.relatedAction?.[0];
  const toleranceExt = action.extension?.find(e => e.url.includes('tolerance'));
  const repeat = action.timingTiming?.repeat;
  const intelligenceRules = action.action?.length ?? 0;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">{index}.</span>
        <span className="font-medium text-gray-900">{action.id}</span>
        {action.requiredBehavior && (
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
              action.requiredBehavior === 'must'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {action.requiredBehavior}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>Trigger: {triggerMode}{resourceType ? ` (${resourceType})` : ''}</span>
        {codeFilters.length > 0 && (
          <span>
            Filters: {codeFilters.map(f => `${f.path}=${f.code?.map(c => c.code).join(',')}`).join('; ')}
          </span>
        )}
        {relatedAction && (
          <span>
            Timing: after {relatedAction.actionId}
            {relatedAction.offsetDuration
              ? ` + ${relatedAction.offsetDuration.value} ${relatedAction.offsetDuration.unit}`
              : ''}
          </span>
        )}
        {toleranceExt?.valueInteger != null && (
          <span>Tolerance: {toleranceExt.valueInteger} days</span>
        )}
        {repeat && (
          <span>
            Repeat: every {repeat.period} {repeat.periodUnit}
            {repeat.count ? ` × ${repeat.count}` : ''}
          </span>
        )}
        {intelligenceRules > 0 && (
          <span className="text-indigo-600">Intelligence rules: {intelligenceRules}</span>
        )}
      </div>
    </div>
  );
}
