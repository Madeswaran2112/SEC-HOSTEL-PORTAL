import React from 'react';
import { Group } from '../../types/group';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Crown, Home } from 'lucide-react';

interface GroupCardProps {
  group: Group;
  currentUserId?: string;
  onDissolve?: () => void;
  onLeave?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, currentUserId, onDissolve, onLeave }) => {
  const isLeader = group.leaderId === currentUserId;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-500" />
            {group.groupName}
          </h3>
          <StatusBadge status={group.status} />
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500">
          <div className="flex items-center mb-2 sm:mb-0">
            <Crown className="h-4 w-4 mr-1 text-yellow-500" /> Leader: {group.leaderName}
          </div>
          <div className="flex items-center mb-2 sm:mb-0">
            <Home className="h-4 w-4 mr-1 text-gray-400" /> Room Pref: {group.preferredRoomType}
          </div>
          <div>Size: {group.currentSize}/{group.maxSize}</div>
        </div>
      </div>
      <div className="px-6 py-5">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Members</h4>
        <ul className="divide-y divide-gray-200">
          {group.members.map((member) => (
            <li key={member.id} className="py-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                  {member.studentName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{member.studentName}</p>
                  <p className="text-xs text-gray-500">{member.registerNumber}</p>
                </div>
              </div>
              <StatusBadge status={member.status} />
            </li>
          ))}
        </ul>
      </div>
      {(isLeader && onDissolve) || (!isLeader && onLeave) ? (
        <div className="bg-gray-50 px-6 py-3 text-right">
          {isLeader && onDissolve && (
            <button
              onClick={onDissolve}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              Dissolve Group
            </button>
          )}
          {!isLeader && onLeave && (
            <button
              onClick={onLeave}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Leave Group
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
