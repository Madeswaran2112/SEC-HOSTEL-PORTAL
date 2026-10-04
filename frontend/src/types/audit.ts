export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  createdAt: string;
}
