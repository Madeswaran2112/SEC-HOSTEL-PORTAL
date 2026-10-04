import React from 'react';
import { WaitingPoolEntry } from '../../types/allocation';
import { Clock, Info } from 'lucide-react';

interface WaitingPoolStatusProps {
  entry: WaitingPoolEntry;
  onLeave?: () => void;
}

export const WaitingPoolStatus: React.FC<WaitingPoolStatusProps> = ({ entry, onLeave }) => {
  return (
    <div className="bg-white shadow rounded-lg border border-blue-200 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 flex items-center border-b border-blue-100">
        <Clock className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg leading-6 font-medium text-blue-900">Waiting Pool Status</h3>
      </div>
      <div className="px-6 py-5">
        <div className="flex items-start mb-4">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <p className="text-sm text-gray-600">
            You are currently in the waiting pool for room allocation. You will be automatically assigned a room when one matching your preferences becomes available.
          </p>
        </div>
        
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-md">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</dt>
            <dd className="mt-1 text-2xl font-semibold text-gray-900">{entry.priority}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{new Date(entry.joinedAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pref. Room Type</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{entry.preferredRoomType || 'Any'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pref. Hostel Type</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">{entry.hostelTypePreference || 'Any'}</dd>
          </div>
        </dl>
        
        {onLeave && (
          <div className="mt-6">
            <button
              onClick={onLeave}
              className="text-sm text-red-600 hover:text-red-500 font-medium focus:outline-none"
            >
              Leave Waiting Pool
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
