import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthContext,
  AuthContextType,
  User,
  SignupData,
} from "./AuthContextInstance";

interface LoginResponse {
  user: User;
  token: string;
}

interface ApiError {
  message: string;
}

// Backend API base URL - update this with your actual backend URL
const API_BASE_URL = "http://192.168.15.8:9000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function for API calls
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        const errorData: ApiError = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.message);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData && token) {
          // Verify token is still valid with backend
          try {
            const userInfo = await apiRequest("/auth/verify");
            setUser(userInfo.user);
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: LoginResponse = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      navigate("/");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...signupData } = userData;

      const response: LoginResponse = await apiRequest("/system_users", {
        method: "POST",
        body: JSON.stringify(signupData),
      });

      setUser(response.user);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);

      navigate("/");
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = () => {
    // For Google OAuth, you'll typically redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const contextValue: AuthContextType = {
    user,
    login,
    signup,
    logout,
    googleSignIn,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
