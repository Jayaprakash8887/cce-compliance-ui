import { useState } from 'react';
import { usePatientEvents } from '../../hooks/usePatientEvents';
import { formatDateTime } from '../../utils/dates';
import LoadingSpinner from '../common/LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PAGE_SIZE } from '../../config';

interface EventTrailProps {
  patientId: string;
}

export default function EventTrail({ patientId }: EventTrailProps) {
  const [page, setPage] = useState(0);
  const { data, isLoading } = usePatientEvents(patientId, page, PAGE_SIZE);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Event Trail</h2>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.content.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">No events recorded</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Match</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((event) => (
                  <tr key={event.id} className="border-b border-gray-50">
                    <td className="whitespace-nowrap px-4 py-2 text-gray-600">
                      {formatDateTime(event.eventTime)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">{event.source}</td>
                    <td className="px-4 py-2 text-gray-600">{event.type}</td>
                    <td className="px-4 py-2 text-gray-600">{event.actionId ?? '—'}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          event.processingStatus === 'matched'
                            ? 'bg-green-100 text-green-700'
                            : event.processingStatus === 'duplicate'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {event.processingStatus === 'matched' ? '✓' : event.processingStatus === 'duplicate' ? 'dup' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">
              Page {data.pageable.pageNumber + 1} of {data.totalPages} ({data.totalElements} events)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={data.first}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={data.last}
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
