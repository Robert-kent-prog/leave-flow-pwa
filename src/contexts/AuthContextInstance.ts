// contexts/AuthContextInstance.ts
import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  department: string;
  phone: string;
  role: "admin" | "manager" | "hr";
  avatar?: string;
  // Optional: add staffId and fullName if you use them in the app
  staffId?: string;
  fullName?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
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
  fullName: string;       // ← added
  department: string;
  phone: string;
  role: "admin" | "manager" | "hr"; // ← added
}

// Create the context here
export const AuthContext = createContext<AuthContextType | undefined>(undefined);