import React from 'react';
import { Check, X, Users } from 'lucide-react';

interface InvitationCardProps {
  invitation: any;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({ invitation, onAccept, onDecline }) => {
  return (
    <div className="bg-white shadow rounded-lg p-5 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">{invitation.groupName || 'Group Invitation'}</h3>
            <p className="text-sm text-gray-500">
              Invited by <span className="font-medium text-gray-700">{invitation.leaderName || 'Unknown'}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(invitation.invitedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex space-x-3">
        <button
          onClick={() => onAccept(invitation.groupId)}
          className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <Check className="mr-2 h-4 w-4" /> Accept
        </button>
        <button
          onClick={() => onDecline(invitation.groupId)}
          className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <X className="mr-2 h-4 w-4" /> Decline
        </button>
      </div>
    </div>
  );
};
