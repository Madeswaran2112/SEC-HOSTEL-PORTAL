import { STATUS_COLORS } from './constants';

export const formatDate = (dateVal?: any): string => {
  if (!dateVal) return '-';
  try {
    if (Array.isArray(dateVal)) {
      const [year, month, day] = dateVal;
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return String(dateVal);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return String(dateVal);
  }
};

export const formatDateTime = (dateVal?: any): string => {
  if (!dateVal) return '-';
  try {
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return String(dateVal);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(dateVal);
  }
};

export const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatStatus = (status?: string | null): string => {
  if (!status) return '';
  return String(status).replace(/_/g, ' ');
};

export const getStatusColor = (status?: string | null): string => {
  if (!status) return 'bg-gray-100 text-gray-800';
  return STATUS_COLORS[String(status).toUpperCase()] || 'bg-gray-100 text-gray-800';
};
