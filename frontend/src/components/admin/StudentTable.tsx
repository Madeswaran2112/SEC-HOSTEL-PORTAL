import React from 'react';
import { DataTable } from '../common/DataTable';
import { Student } from '../../types/student';
import { StatusBadge } from '../common/StatusBadge';
import { useNavigate } from 'react-router-dom';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students, loading, page, totalPages, totalElements, onPageChange
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'name',
      header: 'Student Info',
      render: (item: Student) => (
        <div>
          <div className="font-medium text-gray-900">{item.name}</div>
          <div className="text-gray-500 text-xs">{item.registerNumber} • {item.email}</div>
        </div>
      )
    },
    {
      key: 'academic',
      header: 'Academic',
      render: (item: Student) => (
        <div>
          <div className="text-gray-900 text-sm">{item.department}</div>
          <div className="text-gray-500 text-xs">Year {item.year}</div>
        </div>
      )
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (item: Student) => (
        <span className="capitalize text-sm text-gray-700">{item.gender.toLowerCase()}</span>
      )
    },
    {
      key: 'allocationStatus',
      header: 'Status',
      render: (item: Student) => <StatusBadge status={item.allocationStatus} />
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={students}
      loading={loading}
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={onPageChange}
      onRowClick={(student) => navigate(`/admin/students/${student.id}`)}
      emptyTitle="No students found"
    />
  );
};
