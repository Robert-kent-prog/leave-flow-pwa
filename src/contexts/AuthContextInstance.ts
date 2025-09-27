// contexts/AuthContextInstance.ts
import { createContext } from "react";

export interface User {
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
  changePassword: (passwordData: ChangePasswordData) => Promise<boolean>; // Add this line
  updateProfile: (updateData: UpdateProfileData) => Promise<User>; // Adjusted type
  googleSignIn: () => void;
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
// Create the context here
export const AuthContext = createContext<AuthContextType | undefined>(undefined);