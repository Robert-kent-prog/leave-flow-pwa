export type SystemRole = "admin" | "hr" | "assistant_hr" | "employee";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type NotificationPriority = "low" | "medium" | "high";

export type NotificationType =
  | "leave_approval"
  | "leave_rejection"
  | "new_request"
  | "reminder"
  | "system";

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T;
  message?: string;
}

export interface ApiSystemUser {
  _id: string;
  username: string;
  staffId: string;
  email: string;
  phone: string;
  department?: string;
  designation?: string;
  dutyStation?: string;
  role: SystemRole;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiLeaveRecord {
  _id: string;
  employeeName: string;
  pno: string;
  designation: string;
  dutyStation: string;
  phone: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveRequestStatus;
  reason: string;
  applicationDate?: string;
  reviewedBy?: string | ApiSystemUser;
  reviewedAt?: string;
  comments?: string;
  createdBy?: string | ApiSystemUser;
  requestedFor?: string | ApiSystemUser;
  history?: ApiLeaveHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiLeaveHistoryEntry {
  action: "submitted" | "updated" | "approved" | "rejected" | "cancelled";
  status: LeaveRequestStatus;
  actor: string | ApiSystemUser;
  comment?: string;
  timestamp: string;
}

export interface ApiEmployeeRecord extends ApiSystemUser {
  employeeName: string;
  pno: string;
}

export interface ApiLeaveBalanceEntry {
  leaveType: string;
  label: string;
  allowance: number;
  minNoticeDays: number;
  tracksBalance: boolean;
  used: number;
  pending: number;
  remaining: number | null;
}

export interface ApiLeaveBalanceSummary {
  year: number;
  employeeName: string | null;
  staffId: string;
  balances: ApiLeaveBalanceEntry[];
}

export interface ApiNotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  priority: NotificationPriority;
  createdAt: string;
  updatedAt: string;
}

export interface ApiHoliday {
  _id: string;
  name: string;
  date: string;
  type: "public" | "company";
  description?: string;
  createdBy?: string | ApiSystemUser;
  createdAt?: string;
  updatedAt?: string;
}
