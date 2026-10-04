import React, { useEffect, useState } from 'react';
import { allocationApi } from '../../api/allocationApi';
import { Allocation } from '../../types/allocation';
import { AllocationCard } from '../../components/student/AllocationCard';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Home } from 'lucide-react';
import toast from 'react-hot-toast';

export const AllocationStatus: React.FC = () => {
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllocation = async () => {
    try {
      setLoading(true);
      const res = await allocationApi.getMyAllocation();
      setAllocation(res.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load allocation status');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation();
  }, []);

  const handleAccept = async () => {
    if (!allocation) return;
    try {
      await allocationApi.accept(allocation.id);
      toast.success('Room allocation accepted');
      fetchAllocation();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept allocation');
    }
  };

  const handleReject = async () => {
    if (!allocation || !window.confirm('Are you sure you want to reject this allocation? You will lose this room.')) return;
    try {
      await allocationApi.reject(allocation.id);
      toast.success('Room allocation rejected');
      fetchAllocation();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject allocation');
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Allocation Status</h1>

      {!allocation ? (
        <EmptyState
          title="No Allocation Yet"
          description="You have not been allocated a room yet. If the allocation window is open, please wait for the automated process, or check your waiting pool status."
          icon={<Home className="h-10 w-10" />}
        />
      ) : (
        <div className="max-w-2xl mx-auto">
          <AllocationCard 
            allocation={allocation}
            onAccept={allocation.status === 'PENDING' ? handleAccept : undefined}
            onReject={allocation.status === 'PENDING' ? handleReject : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default AllocationStatus;
