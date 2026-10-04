export enum NotificationType {
  GROUP_INVITE = 'GROUP_INVITE',
  GROUP_UPDATE = 'GROUP_UPDATE',
  ALLOCATION = 'ALLOCATION',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  isRead: boolean;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
}

