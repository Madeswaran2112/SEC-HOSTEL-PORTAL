import React, { useEffect, useState } from 'react';
import { groupApi } from '../../api/groupApi';
import { InvitationCard } from '../../components/student/InvitationCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const GroupInvitations: React.FC = () => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await groupApi.getInvitations();
      setInvitations(res.data);
    } catch (error) {
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (groupId: string) => {
    try {
      await groupApi.acceptInvite(groupId);
      toast.success('Invitation accepted');
      navigate('/student/group');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
      fetchInvitations();
    }
  };

  const handleDecline = async (groupId: string) => {
    try {
      await groupApi.declineInvite(groupId);
      toast.success('Invitation declined');
      fetchInvitations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to decline invitation');
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Group Invitations</h1>

      {invitations.length === 0 ? (
        <EmptyState
          title="No pending invitations"
          description="You don't have any pending group invitations at the moment."
          icon={<Mail className="h-10 w-10" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitations.map((inv) => (
            <InvitationCard
              key={inv.groupId}
              invitation={inv}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupInvitations;
