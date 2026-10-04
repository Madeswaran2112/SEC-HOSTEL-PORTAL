import React from 'react';
import { getStatusColor, formatStatus } from '../../utils/formatters';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  if (!status) return null;
  
  const colorClass = getStatusColor(status);
  const formattedStatus = formatStatus(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {formattedStatus}
    </span>
  );
};

