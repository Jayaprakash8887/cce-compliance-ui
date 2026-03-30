import { useNavigate } from 'react-router-dom';
import { useProtocolDefinitions } from '../hooks/useProtocolDefinitions';
import { extractProtocolName } from '../utils/compliance';
import { formatDate } from '../utils/dates';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function ProtocolListPage() {
  const { data: protocols, isLoading, error } = useProtocolDefinitions();
  const navigate = useNavigate();

  document.title = 'Protocols — CCE Compliance';

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Failed to load protocols: {error.message}
      </div>
    );
  }

  if (!protocols || protocols.length === 0) {
    return <EmptyState message="No protocol definitions loaded" actionLabel="Back to Dashboard" actionHref="/" />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Protocol Definitions</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {protocols.map((p) => (
          <div
            key={p.id}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => navigate(`/protocols/${p.id}`)}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-gray-900">{extractProtocolName(p)}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  p.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {p.status.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Version: {p.version}</p>
            <p className="mt-0.5 truncate text-xs text-gray-400" title={p.url}>{p.url}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span>Actions: {p.definition.action?.length ?? 0}</span>
              <span>Loaded: {formatDate(p.loadedAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
