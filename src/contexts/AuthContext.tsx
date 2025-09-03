import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  username: string;
  email: string;
  department: string;
  phone: string;
  role: "admin" | "manager" | "employee";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  googleSignIn: () => void;
  isLoading: boolean;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  phone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData && token) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation - replace with real authentication
      if (email && password.length >= 6) {
        const userData: User = {
          id: "1",
          username: "HR Admin",
          email: email,
          department: "Human Resources",
          phone: "+1 (555) 123-4567",
          role: "admin",
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "mock-jwt-token");

        navigate("/");
        return true;
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation - replace with real registration
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        department: userData.department,
        phone: userData.phone,
        role: "employee", // Default role for new signups
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", "mock-jwt-token");

      navigate("/");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = () => {
    // This would integrate with Google OAuth
    // For now, we'll simulate a successful Google login
    const googleUser: User = {
      id: "google-123",
      username: "Google User",
      email: "google.user@company.com",
      department: "IT",
      phone: "+1 (555) 987-6543",
      role: "employee",
    };

    setUser(googleUser);
    localStorage.setItem("user", JSON.stringify(googleUser));
    localStorage.setItem("token", "google-oauth-token");

    navigate("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, googleSignIn, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
