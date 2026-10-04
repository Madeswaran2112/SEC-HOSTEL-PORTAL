import React, { useEffect, useState } from 'react';
import { waitingPoolApi, windowApi } from '../../api/allocationApi';
import { roomTypeApi } from '../../api/roomApi';
import { WaitingPoolEntry, AllocationWindow } from '../../types/allocation';
import { WaitingPoolStatus as WaitingPoolStatusComponent } from '../../components/student/WaitingPoolStatus';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FormField } from '../../components/common/FormField';
import { SelectOption } from '../../types/common';
import { Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const WaitingPool: React.FC = () => {
  const [status, setStatus] = useState<WaitingPoolEntry | null>(null);
  const [activeWindow, setActiveWindow] = useState<AllocationWindow | null>(null);
  const [roomTypes, setRoomTypes] = useState<SelectOption[]>([]);
  const [preferredRoomTypeId, setPreferredRoomTypeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await waitingPoolApi.getMyStatus();
      setStatus(res.data);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching pool status', error);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await fetchStatus();
        
        const [windowRes, typesRes] = await Promise.all([
          windowApi.getActive(),
          roomTypeApi.getAll()
        ]);
        
        setActiveWindow(windowRes.data);
        setRoomTypes(typesRes.data.map(rt => ({ label: rt.name, value: rt.id })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWindow) return;
    
    try {
      setJoining(true);
      await waitingPoolApi.join({
        allocationWindowId: activeWindow.id,
        preferredRoomTypeId: preferredRoomTypeId || undefined
      });
      toast.success('Joined waiting pool successfully');
      await fetchStatus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join waiting pool');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave the waiting pool? You will lose your priority position.')) return;
    try {
      await waitingPoolApi.leave();
      toast.success('Left waiting pool');
      setStatus(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to leave waiting pool');
    }
  };

  if (loading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Waiting Pool</h1>

      {status ? (
        <div className="max-w-2xl mx-auto">
          <WaitingPoolStatusComponent entry={status} onLeave={handleLeave} />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Not in Waiting Pool</h3>
            <p className="mt-1 text-sm text-gray-500">
              Join the waiting pool if you missed the primary allocation or didn't get a room.
            </p>
          </div>

          {!activeWindow ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-700">
                There is currently no active allocation window. You cannot join the waiting pool right now.
              </p>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <FormField
                as="select"
                label="Preferred Room Type (Optional)"
                name="preferredRoomTypeId"
                options={roomTypes}
                value={preferredRoomTypeId}
                onChange={(e) => setPreferredRoomTypeId(e.target.value)}
              />
              <button
                type="submit"
                disabled={joining}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {joining ? 'Joining...' : 'Join Waiting Pool'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default WaitingPool;
