export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  ADMIN: 'ROLE_ADMIN',
  SUPER_ADMIN: 'ROLE_SUPER_ADMIN'
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  AVAILABLE: 'bg-green-100 text-green-800',
  FULL: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-orange-100 text-orange-800',
  BLOCKED: 'bg-gray-100 text-gray-800',
  FORMING: 'bg-blue-100 text-blue-800',
  COMPLETE: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-amber-100 text-amber-800',
  ALLOCATED: 'bg-purple-100 text-purple-800',
  DISSOLVED: 'bg-red-100 text-red-800',
  UPCOMING: 'bg-blue-100 text-blue-800',
  OPEN: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ALLOCATION_RUNNING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  IN_POOL: 'bg-indigo-100 text-indigo-800',
  NOT_APPLIED: 'bg-gray-100 text-gray-800'
};

