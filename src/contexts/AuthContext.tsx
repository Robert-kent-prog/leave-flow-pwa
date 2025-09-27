import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AuthContext,
  AuthContextType,
  User,
  SignupData,
  UpdateProfileData,
  ChangePasswordData,
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

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

const API_BASE_URL = "http://10.6.119.51:9000/api";

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

        if (response.status === 401) {
          console.warn("🔒 Token expired or invalid — logging out");
          logout();
        }

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

  // Helper: Validate if user object is valid
  const isValidUser = (user: unknown): user is User => {
    return (
      typeof user === "object" &&
      user !== null &&
      "_id" in user &&
      "email" in user &&
      "username" in user
    );
  };

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        // First, try to set user from localStorage immediately for fast UI
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            if (isValidUser(parsedUser)) {
              setUser(parsedUser);
            } else {
              localStorage.removeItem("user");
              localStorage.removeItem("token");
            }
          } catch (parseError) {
            console.error("Error parsing localStorage user:", parseError);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          }
        }

        // Then verify with backend in background
        if (userData && token) {
          try {
            const response: VerifyTokenResponse = await apiRequest(
              "/auth/verify"
            );

            if (response.valid && isValidUser(response.user)) {
              setUser(response.user);
              localStorage.setItem("user", JSON.stringify(response.user));
            } else {
              if (!isValidUser(user)) {
                setUser(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
              }
            }
          } catch (error) {
            console.error("Token verification failed:", error);
            if (!isValidUser(user)) {
              setUser(null);
              localStorage.removeItem("user");
              localStorage.removeItem("token");
            }
          }
        } else if (!userData && !token) {
          setUser(null);
        }
      } catch (error) {
        if (!isValidUser(user)) {
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...signupData } = userData;

      // Create system user account
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

      if (!signupResult.success) {
        throw new Error(signupResult.message || "Signup failed");
      }

      // Auto-login with email
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userData.email,
          password: userData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData: LoginResponse = await loginResponse.json();
        setUser(loginData.user);
        localStorage.setItem("user", JSON.stringify(loginData.user));
        localStorage.setItem("token", loginData.accessToken);
        navigate("/", { replace: true });
        return true;
      } else {
        // Fallback to username login
        const loginResponse2 = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: userData.username,
            password: userData.password,
          }),
        });

        if (loginResponse2.ok) {
          const loginData: LoginResponse = await loginResponse2.json();
          setUser(loginData.user);
          localStorage.setItem("user", JSON.stringify(loginData.user));
          localStorage.setItem("token", loginData.accessToken);
          navigate("/", { replace: true });
          return true;
        } else {
          const errorData = await loginResponse2.json();
          throw new Error(
            `Signup successful but auto-login failed: ${errorData.message}`
          );
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Signup failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          errorMessage =
            "An account with this email or username already exists.";
        } else if (error.message.includes("auto-login failed")) {
          errorMessage = "Account created successfully! Please login manually.";
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
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  const googleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // Updated updateProfile function in AuthContext
  const updateProfile = async (
    updateData: UpdateProfileData
  ): Promise<User> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userId = user._id || user.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiRequest(`/system_users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      console.log("Backend response:", response); // Debug log

      // Check if response has success property or directly contains user
      if (response.success === false) {
        throw new Error(response.message || "Profile update failed");
      }

      // Handle different response structures
      const updatedUser = response.user || response;

      if (!updatedUser) {
        throw new Error("No user data returned from server");
      }

      // Ensure the user object has both _id and id
      const userWithId = {
        ...updatedUser,
        id: updatedUser._id || updatedUser.id,
      };

      console.log("Processed user:", userWithId); // Debug log

      // Update local state and storage
      setUser(userWithId);
      localStorage.setItem("user", JSON.stringify(userWithId));

      return userWithId;
    } catch (error) {
      console.error("Profile update error:", error);

      // Don't logout on profile update errors
      // Remove the automatic logout from apiRequest for this call
      const errorMessage =
        error instanceof Error ? error.message : "Profile update failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated changePassword function in AuthContext
  const changePassword = async (
    passwordData: ChangePasswordData
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Use _id instead of id since MongoDB uses _id
      const userId = user._id || user.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Frontend validation
      if (passwordData.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long");
      }

      const response: ChangePasswordResponse = await apiRequest(
        `/system_users/${userId}/change-password`,
        {
          method: "PATCH",
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Password change failed");
      }

      return true;
    } catch (error) {
      console.error("Password change error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Password change failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      console.log(`Resetting password for email: ${email}`);
      return true;
    } catch (error) {
      console.error("Error resetting password:", error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    changePassword,
    googleSignIn,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
