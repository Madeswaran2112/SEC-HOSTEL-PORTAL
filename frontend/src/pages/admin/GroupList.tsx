import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupApi } from '../../api/groupApi';
import { Group } from '../../types/group';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchFilter } from '../../components/common/SearchFilter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { UserCheck, Eye, Trash2, Check, ShieldCheck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hostelTypeFilter, setHostelTypeFilter] = useState('ALL');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(search, 400);
  const { page, size, handlePageChange } = usePagination(0, 10);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await groupApi.getAll(page, size, statusParam);
      if (res.data) {
        let content = res.data.content || [];
        if (hostelTypeFilter !== 'ALL') {
          content = content.filter(g => g.hostelTypePreference === hostelTypeFilter);
        }
        if (debouncedSearch) {
          content = content.filter(g =>
            g.groupName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            g.leaderName?.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        setGroups(content);
        setTotalElements(res.data.totalElements || content.length);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      toast.error('Failed to load student groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [page, size, debouncedSearch, statusFilter, hostelTypeFilter]);

  const handleVerify = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await groupApi.verifyGroup(id);
      toast.success('Group marked as Verified');
      fetchGroups();
    } catch {
      toast.error('Failed to verify group');
    }
  };

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await groupApi.approveGroup(id);
      toast.success('Group Approved for Room Allocation');
      fetchGroups();
    } catch {
      toast.error('Failed to approve group');
    }
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const reason = window.prompt('Please enter rejection reason:');
    if (reason === null) return;
    try {
      await groupApi.rejectGroup(id, reason);
      toast.success('Group application rejected');
      fetchGroups();
    } catch {
      toast.error('Failed to reject group');
    }
  };

  const handleDissolve = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to dissolve this group? Members will become individual applicants.')) {
      return;
    }
    try {
      await groupApi.dissolve(id);
      toast.success('Group dissolved successfully');
      fetchGroups();
    } catch {
      toast.error('Failed to dissolve group');
    }
  };

  const columns: Column<Group>[] = [
    {
      key: 'groupName',
      header: 'Group Name',
      render: (g: Group) => (
        <div>
          <div className="font-semibold text-gray-900">{g.groupName}</div>
          <div className="text-xs text-gray-500">Preference: {g.preferredRoomType || 'Standard'}</div>
        </div>
      )
    },
    {
      key: 'leaderName',
      header: 'Group Leader',
      render: (g: Group) => <span className="text-sm font-medium text-gray-700">{g.leaderName || 'Unknown'}</span>
    },
    {
      key: 'size',
      header: 'Members',
      render: (g: Group) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {g.currentSize} / {g.maxSize} members
        </span>
      )
    },
    {
      key: 'hostelTypePreference',
      header: 'Hostel Block',
      render: (g: Group) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
          g.hostelTypePreference === 'BOYS' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
        }`}>
          {g.hostelTypePreference || '-'} HOSTEL
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (g: Group) => <StatusBadge status={String(g.status)} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (g: Group) => (
        <div className="flex items-center space-x-2">
          {g.status === 'PENDING' && (
            <button
              onClick={(e) => handleVerify(e, g.id)}
              className="text-xs px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded font-medium inline-flex items-center"
              title="Verify Group"
            >
              <Check className="h-3 w-3 mr-1" /> Verify
            </button>
          )}

          {(g.status === 'VERIFIED' || g.status === 'PENDING') && (
            <button
              onClick={(e) => handleApprove(e, g.id)}
              className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded font-medium inline-flex items-center"
              title="Approve Group"
            >
              <ShieldCheck className="h-3 w-3 mr-1" /> Approve
            </button>
          )}

          {(g.status === 'PENDING' || g.status === 'VERIFIED') && (
            <button
              onClick={(e) => handleReject(e, g.id)}
              className="text-xs px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-300 rounded font-medium inline-flex items-center"
              title="Reject Group"
            >
              <XCircle className="h-3 w-3 mr-1" /> Reject
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/groups/${g.id}`);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-xs font-medium inline-flex items-center ml-1"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </button>

          {g.status !== 'DISSOLVED' && g.status !== 'ALLOCATED' && (
            <button
              onClick={(e) => handleDissolve(e, g.id)}
              className="text-gray-400 hover:text-red-600 text-xs font-medium inline-flex items-center ml-1"
              title="Dissolve Group"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-indigo-600" />
            Student Groups & Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review submitted student groups, verify registration eligibility, and approve groups for automated room allocation.
          </p>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by group name or leader..."
        filters={[
          {
            label: 'Hostel Block',
            key: 'hostelType',
            value: hostelTypeFilter,
            onChange: setHostelTypeFilter,
            options: [
              { label: 'All Hostels', value: 'ALL' },
              { label: 'Boys Hostel', value: 'BOYS' },
              { label: 'Girls Hostel', value: 'GIRLS' }
            ]
          },
          {
            label: 'Group Status',
            key: 'status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending Review', value: 'PENDING' },
              { label: 'Verified', value: 'VERIFIED' },
              { label: 'Approved for Allocation', value: 'APPROVED' },
              { label: 'Allocated', value: 'ALLOCATED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Forming', value: 'FORMING' },
              { label: 'Dissolved', value: 'DISSOLVED' }
            ]
          }
        ]}
      />

      <DataTable
        columns={columns}
        data={groups}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onRowClick={(g) => navigate(`/admin/groups/${g.id}`)}
        emptyTitle="No groups found"
        emptyDescription="No student groups match the selected criteria."
      />
    </div>
  );
};

export default GroupList;
