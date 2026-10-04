import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupApi } from '../../api/groupApi';
import { Group } from '../../types/group';
import { GroupCard } from '../../components/student/GroupCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FormField } from '../../components/common/FormField';
import useAuth from '../../hooks/useAuth';
import { Users, Plus, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export const GroupManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteIdentifier, setInviteIdentifier] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const res = await groupApi.getMyGroup();
      setGroup(res.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load group details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !inviteIdentifier) return;

    try {
      setInviting(true);
      // Determine if email or register number based on @ symbol
      const payload = inviteIdentifier.includes('@') 
        ? { email: inviteIdentifier }
        : { registerNumber: inviteIdentifier };
        
      await groupApi.invite(group.id, payload);
      toast.success('Invitation sent successfully');
      setInviteIdentifier('');
      fetchGroup(); // Refresh to see pending member
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleDissolve = async () => {
    if (!group || !window.confirm('Are you sure you want to dissolve this group? All members will be removed.')) return;
    try {
      await groupApi.dissolve(group.id);
      toast.success('Group dissolved');
      setGroup(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to dissolve group');
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
      </div>

      {!group ? (
        <EmptyState
          title="Not in a group"
          description="You are currently not part of any group. Create a group to invite friends and apply for rooms together, or check your invitations."
          icon={<Users className="h-10 w-10" />}
          actionButton={
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => navigate('/student/group/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Group
              </button>
              <button
                onClick={() => navigate('/student/group/invitations')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Mail className="mr-2 h-4 w-4" /> View Invitations
              </button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <GroupCard 
              group={group} 
              currentUserId={user?.id}
              onDissolve={group.leaderId === user?.id ? handleDissolve : undefined}
            />
          </div>
          
          {group.leaderId === user?.id && group.currentSize < group.maxSize && (
            <div className="md:col-span-1">
              <div className="bg-white shadow rounded-lg p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Member</h3>
                <form onSubmit={handleInvite}>
                  <FormField
                    label="Register Number or Email"
                    required
                    value={inviteIdentifier}
                    onChange={(e) => setInviteIdentifier(e.target.value)}
                    placeholder="Enter Reg No / Email"
                  />
                  <button
                    type="submit"
                    disabled={inviting || !inviteIdentifier}
                    className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                </form>
                <p className="mt-4 text-xs text-gray-500">
                  You can invite {group.maxSize - group.currentSize} more members to this group.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
