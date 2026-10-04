import React from 'react';
import { DataTable } from '../common/DataTable';
import { Group } from '../../types/group';
import { StatusBadge } from '../common/StatusBadge';
import { useNavigate } from 'react-router-dom';

interface GroupTableProps {
  groups: Group[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const GroupTable: React.FC<GroupTableProps> = ({
  groups, loading, page, totalPages, totalElements, onPageChange
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'groupName',
      header: 'Group Name',
      render: (item: Group) => (
        <div className="font-medium text-indigo-600">{item.groupName}</div>
      )
    },
    {
      key: 'leaderName',
      header: 'Leader',
      render: (item: Group) => (
        <div className="text-sm text-gray-900">{item.leaderName}</div>
      )
    },
    {
      key: 'size',
      header: 'Size',
      render: (item: Group) => (
        <div className="text-sm text-gray-700">{item.currentSize} / {item.maxSize}</div>
      )
    },
    {
      key: 'preference',
      header: 'Room Preference',
      render: (item: Group) => (
        <div className="text-sm text-gray-500">{item.preferredRoomType}</div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Group) => <StatusBadge status={item.status} />
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={groups}
      loading={loading}
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={onPageChange}
      onRowClick={(group) => navigate(`/admin/groups/${group.id}`)}
      emptyTitle="No groups found"
    />
  );
};
