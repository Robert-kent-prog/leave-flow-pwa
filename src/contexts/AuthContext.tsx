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
  accessToken: string;
  message: string;
}

interface VerifyTokenResponse {
  valid: boolean;
  user: User;
}

const API_BASE_URL = "http://192.168.139.8:9000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function for authenticated API calls
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
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  };

  // Check if user is logged in on app load using token verification
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData && token) {
          try {
            // Verify token with backend
            const response: VerifyTokenResponse = await apiRequest(
              "/auth/verify"
            );
            if (response.valid) {
              setUser(response.user);
            } else {
              throw new Error("Token invalid");
            }
          } catch (error) {
            console.log("Token verification failed, clearing auth data");
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data: LoginResponse = await response.json();

      // Store user data and token
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.accessToken);

      // Navigate to dashboard
      navigate("/", { replace: true });
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

  // Enhanced signup function with better error handling
  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...signupData } = userData;

      // console.log("Sending signup data:", signupData);

      // Step 1: Create user account
      const signupResponse = await fetch(`${API_BASE_URL}/system_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const signupResult = await signupResponse.json();
      // console.log("Signup response:", signupResult);

      // Check if signup was successful
      if (!signupResult.success) {
        throw new Error(signupResult.message || "Signup failed");
      }

      // console.log("User created successfully, attempting auto-login...");

      // Step 2: Auto-login the user
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userData.email, // Try email first
          password: userData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData: LoginResponse = await loginResponse.json();
        // console.log("Auto-login successful:", loginData);

        // Auto-authenticate the user
        setUser(loginData.user);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("token", loginData.accessToken);

        navigate("/", { replace: true });
        return true;
      } else {
        const loginResponse2 = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: userData.username, // Try username
            password: userData.password,
          }),
        });

        if (loginResponse2.ok) {
          const loginData: LoginResponse = await loginResponse2.json();
          // console.log("Auto-login with username successful:", loginData);

          setUser(loginData.user);
          localStorage.setItem("user", JSON.stringify(loginData.user));
          localStorage.setItem("token", loginData.accessToken);

          navigate("/", { replace: true });
          return true;
        } else {
          // Both login attempts failed
          const errorData = await loginResponse2.json();
          throw new Error(
            `Signup successful but auto-login failed: ${errorData.message}`
          );
        }
      }
    } catch (error) {
      console.error("Signup error:", error);

      // Provide user-friendly error messages
      let errorMessage = "Signup failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          errorMessage =
            "An account with this email or username already exists.";
        } else if (error.message.includes("auto-login failed")) {
          errorMessage = "Account created successfully! Please login manually.";
          // Optionally navigate to login page
          setTimeout(() => navigate("/login"), 2000);
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint if needed
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear frontend state
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const googleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
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
