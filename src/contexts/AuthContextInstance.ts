// contexts/AuthContextInstance.ts
import { createContext } from "react";

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  phone: string;
  role: "admin" | "hr";
  avatar?: string;
  staffId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  changePassword: (passwordData: ChangePasswordData) => Promise<boolean>;
  updateProfile: (updateData: UpdateProfileData) => Promise<User>; 
  googleSignIn: () => void;
  deleteAccount: () => Promise<boolean>; 
  isLoading: boolean;
}

// ✅ Updated to match actual form data
export interface SignupData {
  username: string;
  staffId: string;        // ← added
  email: string;
  password: string;
  confirmPassword: string; // only for frontend validation
  phone: string;
  role: "admin" | "hr"; // ← added
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  staffId?: string; // ← added
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string; // Add this property
}

// Already defined by you
export interface LeaveRequestData {
  employeeName: string;
  pno: string;
  designation: string;
  dutyStation: string;
  phone: string;
  leaveType: string;
    startDate?: Date | string;
    endDate?: Date | string;
  reason: string;
  createdBy: string;
}

export interface LeaveRequestResponse {
  leaveRequest: {
    _id: string;
    employeeName: string;
    pno: string;
    designation: string;
    dutyStation: string;
    phone: string;
    leaveType: string;
    startDate?: Date | string;
    endDate?: Date | string;
    reason: string;
    days: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

// NEW: Add these
export type UpdateLeaveRequestData = Partial<Omit<LeaveRequestData, 'createdBy'>>;

export interface LeaveRequestsListResponse {
  leaveRequests: LeaveRequestResponse['leaveRequest'][];
  message: string;
}

export interface DeleteResponse {
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiContextType {
  createLeaveRequest: (leaveData: LeaveRequestData) => Promise<LeaveRequestResponse>;
  getLeaveRequestsByPno: (pno: string) => Promise<LeaveRequestsListResponse>;
  getLeaveRequestById: (id: string) => Promise<LeaveRequestResponse>;
  updateLeaveRequest: (id: string, updateData: UpdateLeaveRequestData) => Promise<LeaveRequestResponse>;
  deleteLeaveRequest: (id: string) => Promise<DeleteResponse>;
  cancelLeaveRequest: (id: string) => Promise<LeaveRequestResponse>;
  apiRequest: <T = unknown>(endpoint: string, options?: RequestInit) => Promise<T>;
  isLoading: boolean;
}

export const ApiContext = createContext<ApiContextType | undefined>(undefined);
// Create the context here
export const AuthContext = createContext<AuthContextType | undefined>(undefined);