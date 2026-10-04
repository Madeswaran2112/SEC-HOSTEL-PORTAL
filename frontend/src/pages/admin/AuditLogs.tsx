import React, { useEffect, useState } from 'react';
import { auditApi } from '../../api/auditApi';
import { AuditLog } from '../../types/audit';
import { DataTable, Column } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { usePagination } from '../../hooks/usePagination';
import { formatDateTime } from '../../utils/formatters';
import { ShieldAlert, Eye, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { page, size, handlePageChange } = usePagination(0, 15);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getAll(page, size);
      if (res.data) {
        setLogs(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, size]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log: AuditLog) => (
        <span className="text-xs text-gray-600 font-mono">
          {formatDateTime(log.createdAt)}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Action / Event',
      render: (log: AuditLog) => (
        <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
          {log.action}
        </span>
      )
    },
    {
      key: 'entityType',
      header: 'Target Entity',
      render: (log: AuditLog) => (
        <span className="text-xs text-gray-700">
          {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
        </span>
      )
    },
    {
      key: 'userName',
      header: 'Operator',
      render: (log: AuditLog) => (
        <span className="text-xs font-medium text-gray-900">
          {log.userName || 'System / Batch Engine'}
        </span>
      )
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (log: AuditLog) => (
        <span className="text-xs font-mono text-gray-500">
          {log.ipAddress || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Payload',
      render: (log: AuditLog) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(log);
          }}
          className="text-xs text-indigo-600 hover:text-indigo-900 inline-flex items-center font-medium"
        >
          <Eye className="h-3.5 w-3.5 mr-1" /> View Diff
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-indigo-600" />
          System Audit Logs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Immutable audit trail tracking state-changing operations, allocations, overrides, and administrative activity.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        emptyTitle="No audit records"
        emptyDescription="System actions and allocation activities will appear here."
      />

      {/* Payload Modal */}
      <Modal
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title={`Audit Record #${selectedLog?.id || ''} - ${selectedLog?.action || ''}`}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded">
              <div>
                <span className="text-gray-500 block">Operator:</span>
                <span className="font-semibold text-gray-800">{selectedLog.userName || 'SYSTEM'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">IP Address:</span>
                <span className="font-mono text-gray-800">{selectedLog.ipAddress || 'Internal'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 mb-1">
                <Terminal className="h-3.5 w-3.5 text-gray-500" /> Previous State (Old Value)
              </h4>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                {selectedLog.oldValue || 'null'}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 mb-1">
                <Terminal className="h-3.5 w-3.5 text-gray-500" /> Updated State (New Value)
              </h4>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                {selectedLog.newValue || 'null'}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
