export interface LeaveRequest {
    id: string;
    startDate: Date;
    endDate: Date;
    type: LeaveType;
    status: LeaveStatus;
    reason?: string;
    isHalfDayStart: boolean;
    isHalfDayEnd: boolean;
    userId: string;
    createdAt: Date;
  }
  
  export interface LeaveType {
    id: string;
    name: string;
    color: string;
    deductible: boolean;
  }
  
  export enum LeaveStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DRAFT = 'draft'
  }
  
  export interface LeaveSummary {
    allowance: number;
    pending: number;
    deductible: number;
    nonDeductible: number;
    used: number;
    remaining: number;
  }
  
  export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isWeekend: boolean;
    isToday: boolean;
    leaves: LeaveRequest[];
  }

  export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    department?: string;
  }
  
  export interface CompanyLeaveRequest extends LeaveRequest {
    user: User;
    canEdit?: boolean;
    canApprove?: boolean;
    canDelete?: boolean;
  }
  
  export interface Permission {
    viewLeaves: boolean;
    manageLeaves: boolean;
  }
  
  export interface LeaveAction {
    type: 'edit' | 'delete' | 'approve' | 'reject' | 'revoke';
    label: string;
    icon: string;
    condition: (leave: CompanyLeaveRequest, userPermissions: Permission) => boolean;
  }