import { STATUS_COLORS } from './constants';

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatStatus = (status: string): string => {
  if (!status) return '';
  return status.replace(/_/g, ' ');
};

export const getStatusColor = (status: string): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  return STATUS_COLORS[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

