import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionButton
}) => {
  return (
    <div className="text-center py-12 px-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        {React.isValidElement(icon) ? (
          icon
        ) : typeof icon === 'function' ? (
          React.createElement(icon, { className: 'h-6 w-6' })
        ) : (
          <Inbox className="h-6 w-6" />
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      {actionButton ? (
        <div className="mt-6">{actionButton}</div>
      ) : actionText && onAction ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {actionText}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;

