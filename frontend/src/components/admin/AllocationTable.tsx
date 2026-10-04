import React from 'react';
import { DataTable } from '../common/DataTable';
import { Allocation } from '../../types/allocation';
import { StatusBadge } from '../common/StatusBadge';

interface AllocationTableProps {
  allocations: Allocation[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const AllocationTable: React.FC<AllocationTableProps> = ({
  allocations, loading, page, totalPages, totalElements, onPageChange
}) => {
  const columns = [
    {
      key: 'studentName',
      header: 'Student',
      render: (item: Allocation) => (
        <div>
          <div className="font-medium text-gray-900">{item.studentName}</div>
          <div className="text-gray-500 text-xs">{item.registerNumber}</div>
        </div>
      )
    },
    {
      key: 'room',
      header: 'Room Detail',
      render: (item: Allocation) => (
        <div>
          <div className="font-medium text-gray-900">{item.roomNumber} ({item.hostelName})</div>
          <div className="text-gray-500 text-xs">{item.roomTypeName} • Bed {item.bedNumber}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: Allocation) => (
        <span className="text-xs font-medium text-gray-500 uppercase">{item.allocationType}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Allocation) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={allocations}
      loading={loading}
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={onPageChange}
      emptyTitle="No allocations found"
    />
  );
};
