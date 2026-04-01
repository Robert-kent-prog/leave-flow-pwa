// contexts/AuthContextInstance.ts
import { createContext } from "react";
import { ApiSystemUser } from "@/types/api";

export interface User extends ApiSystemUser {
  id?: string;
  avatar?: string;
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
  staffId: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  department: string;
  designation: string;
  dutyStation: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  designation?: string;
  dutyStation?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string; // Add this property
}

// Already defined by you
export interface LeaveRequestData {
  employeeId?: string;
  leaveType: string;
  startDate?: Date | string;
  endDate?: Date | string;
  reason: string;
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
    status: "pending" | "approved" | "rejected" | "cancelled";
    createdBy: string;
    requestedFor?: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

export type UpdateLeaveRequestData = Partial<Omit<LeaveRequestData, "employeeId">> & {
  comments?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled";
};

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
