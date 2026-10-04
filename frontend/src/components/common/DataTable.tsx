import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  page = 0,
  totalPages = 0,
  totalElements = 0,
  onPageChange,
  onRowClick,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display at this time.'
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <LoadingSpinner size="lg" text="Loading records..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    col.className || ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr
                key={item.id ? String(item.id) : idx}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${
                      col.className || ''
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : (item as Record<string, any>)[col.key] !== undefined
                      ? String((item as Record<string, any>)[col.key])
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page + 1}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
                {totalElements > 0 && (
                  <span> ({totalElements} total items)</span>
                )}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange && onPageChange(page - 1)}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onPageChange && onPageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

