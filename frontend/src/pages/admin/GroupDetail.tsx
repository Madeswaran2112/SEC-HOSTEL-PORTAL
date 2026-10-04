import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupApi } from '../../api/groupApi';
import { Group } from '../../types/group';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { ArrowLeft, Users, ShieldAlert, CheckCircle2, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [dissolving, setDissolving] = useState(false);

  const fetchGroup = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await groupApi.getById(id);
      if (res.data) {
        setGroup(res.data);
      }
    } catch {
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const handleDissolve = async () => {
    if (!group) return;
    if (!window.confirm(`Are you sure you want to dissolve "${group.groupName}"? All invitations will be invalidated and members returned to individual applicant status.`)) {
      return;
    }

    try {
      setDissolving(true);
      await groupApi.dissolve(group.id);
      toast.success('Group dissolved successfully');
      navigate('/admin/groups');
    } catch {
      toast.error('Failed to dissolve group');
    } finally {
      setDissolving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner size="lg" text="Loading group information..." />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Group not found.</p>
        <button
          onClick={() => navigate('/admin/groups')}
          className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          &larr; Back to Groups List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/groups')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Groups
        </button>
        <StatusBadge status={String(group.status)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{group.groupName}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {group.hostelTypePreference} HOSTEL
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Leader: <span className="font-medium text-gray-800">{group.leaderName}</span> &bull; Created {formatDateTime(group.createdAt)}
            </p>
          </div>

          {group.status !== 'DISSOLVED' && group.status !== 'ALLOCATED' && (
            <button
              onClick={handleDissolve}
              disabled={dissolving}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              {dissolving ? 'Dissolving...' : 'Dissolve Group'}
            </button>
          )}
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 border-b border-gray-200">
          <div>
            <span className="text-xs text-gray-500 block">Preferred Room</span>
            <span className="text-sm font-semibold text-gray-900">{group.preferredRoomType || 'Single / Any'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Capacity Target</span>
            <span className="text-sm font-semibold text-gray-900">{group.maxSize} Members</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Accepted Members</span>
            <span className="text-sm font-semibold text-gray-900">{group.currentSize} of {group.maxSize}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Allocation Eligibility</span>
            <span className={`text-sm font-semibold ${group.currentSize === group.maxSize ? 'text-green-600' : 'text-amber-600'}`}>
              {group.currentSize === group.maxSize ? 'Complete Group (Phase 1)' : 'Partial Group (Phase 2)'}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Group Members ({group.members?.length || 0})
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Register No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invitation Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invited Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Response Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {member.studentName}
                        {member.studentId === group.leaderId && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800">
                            Leader
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{member.registerNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {member.status === 'ACCEPTED' ? (
                          <span className="inline-flex items-center text-xs text-green-700 font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> Accepted
                          </span>
                        ) : member.status === 'PENDING' ? (
                          <span className="inline-flex items-center text-xs text-amber-700 font-medium">
                            <Clock className="h-4 w-4 mr-1 text-amber-500" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-red-700 font-medium">
                            <XCircle className="h-4 w-4 mr-1 text-red-500" /> Declined
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(member.invitedAt)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(member.respondedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                      No members recorded in this group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
