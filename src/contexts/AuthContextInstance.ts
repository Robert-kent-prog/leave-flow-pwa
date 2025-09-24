// contexts/AuthContextInstance.ts
import { createContext } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  department: string;
  phone: string;
  role: "admin" | "manager" | "employee";
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  googleSignIn: () => void;
  isLoading: boolean;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  phone: string;
}

// Create the context here
export const AuthContext = createContext<AuthContextType | undefined>(undefined);