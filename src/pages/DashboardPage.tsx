import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProtocolDefinitions } from '../hooks/useProtocolDefinitions';
import { extractProtocolName } from '../utils/compliance';
import { formatDate } from '../utils/dates';
import { DEMO_PATIENTS } from '../config';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { data: protocols, isLoading, error } = useProtocolDefinitions();
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/patients/${encodeURIComponent(trimmed)}`);
      setSearchValue('');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Failed to load protocols: {error.message}
        <button onClick={() => window.location.reload()} className="ml-2 underline">
          Retry
        </button>
      </div>
    );
  }

  const activeProtocols = useMemo(() => protocols?.filter(p => p.status === 'active') ?? [], [protocols]);
  const totalVersions = protocols?.length ?? 0;
  const loadedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return protocols?.filter(p => p.loadedAt.slice(0, 10) === today).length ?? 0;
  }, [protocols]);

  useEffect(() => { document.title = 'Dashboard — CCE Compliance'; }, []);

  return (
    <div className="space-y-6">
      {/* Patient Search */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-lg">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Patient UPID..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go
        </button>
      </form>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Active Protocols" value={activeProtocols.length} />
        <MetricCard label="Total Versions" value={totalVersions} />
        <MetricCard label="Loaded Today" value={loadedToday} />
      </div>

      {/* Active Protocol Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Active Protocol Definitions</h2>
        </div>
        {activeProtocols.length === 0 ? (
          <div className="p-6">
            <EmptyState message="No active protocols loaded" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Version</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Loaded</th>
              </tr>
            </thead>
            <tbody>
              {activeProtocols.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                  onClick={() => navigate(`/protocols/${p.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{extractProtocolName(p)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.version}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.loadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Demo Patient Chips */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Quick Access — Demo Patients</h2>
        <div className="flex flex-wrap gap-2">
          {DEMO_PATIENTS.map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${encodeURIComponent(patient.id)}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <span className="text-gray-900">{patient.id}</span>
              <span className="text-xs text-gray-400">{patient.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
