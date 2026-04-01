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
import { apiFetch, clearStoredAuth } from "@/lib/api";

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
  data: User;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

interface SignupResponse {
  success: boolean;
  message: string;
  data: User;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeUser = (value: User): User => ({
    ...value,
    id: value.id || value._id,
  });

  const apiRequest = async <T = unknown,>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    try {
      return await apiFetch<T>(endpoint, options);
    } catch (error) {
      const status =
        error instanceof Error && "status" in error
          ? Number(error.status)
          : undefined;

      if (status === 401 || status === 403) {
        clearStoredAuth();
        setUser(null);
      }

      console.error("API request failed:", error);
      throw error;
    }
  };

  const isValidUser = (user: unknown): user is User => {
    return (
      typeof user === "object" &&
      user !== null &&
      "_id" in user &&
      "email" in user &&
      "username" in user &&
      "role" in user
    );
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            if (isValidUser(parsedUser)) {
              setUser(normalizeUser(parsedUser));
            } else {
              clearStoredAuth();
            }
          } catch (parseError) {
            clearStoredAuth();
          }
        }

        if (userData && token) {
          try {
            const response = await apiRequest<VerifyTokenResponse>(
              "/auth/verify",
            );

            if (response.valid && isValidUser(response.user)) {
              const normalizedUser = normalizeUser(response.user);
              setUser(normalizedUser);
              localStorage.setItem("user", JSON.stringify(normalizedUser));
            } else {
              if (!isValidUser(user)) {
                setUser(null);
                clearStoredAuth();
              }
            }
          } catch (error) {
            if (!isValidUser(user)) {
              setUser(null);
              clearStoredAuth();
            }
          }
        } else if (!userData && !token) {
          setUser(null);
        }
      } catch (error) {
        if (!isValidUser(user)) {
          setUser(null);
          clearStoredAuth();
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
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      const normalizedUser = normalizeUser(data.user);
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("token", data.accessToken);

      navigate("/", { replace: true });
      return true;
    } catch (error) {
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

      const signupResult = await apiFetch<SignupResponse>("/system_users/signup", {
        method: "POST",
        body: JSON.stringify(signupData),
      });

      if (!signupResult.success) {
        throw new Error(signupResult.message || "Signup failed");
      }

      try {
        return await login(userData.email, userData.password);
      } catch (loginError) {
        return await login(userData.username, userData.password);
      }
    } catch (error) {
      let errorMessage = "Signup failed. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          errorMessage =
            "An account with that staff ID, email, or username already exists.";
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
      // console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearStoredAuth();
      navigate("/login", { replace: true });
    }
  };

  const googleSignIn = () => {
    throw new Error("Google sign-in is not configured for this deployment.");
  };

  // Fixed updateProfile function in AuthContext
  const updateProfile = async (
    updateData: UpdateProfileData,
  ): Promise<User> => {
    setIsLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await apiRequest<UpdateProfileResponse>(
        "/system_users/me",
        {
          method: "PUT",
          body: JSON.stringify({
            username: updateData.username,
            email: updateData.email,
            phone: updateData.phone,
            department: updateData.department,
            designation: updateData.designation,
            dutyStation: updateData.dutyStation,
          }),
        },
      );

      if (response.success === false) {
        throw new Error(response.message || "Profile update failed");
      }

      const userData = response.data;
      if (!userData) {
        throw new Error("No user data returned from server");
      }

      const normalizedUser = normalizeUser(userData);
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      return normalizedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Profile update failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated changePassword function in AuthContext
  const changePassword = async (
    passwordData: ChangePasswordData,
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

      if (passwordData.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters long");
      }

      const response = await apiRequest<ChangePasswordResponse>(
        `/system_users/${userId}/change-password`,
        {
          method: "PATCH",
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      if (!response.success) {
        throw new Error(response.message || "Password change failed");
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password change failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (_email: string): Promise<boolean> => {
    throw new Error(
      "Self-service password reset is not configured. Please contact your HR system administrator.",
    );
  };

  // Add to your AuthContext.tsx
  const deleteAccount = async (): Promise<boolean> => {
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
        method: "DELETE",
      });

      if (!response.success) {
        throw new Error(response.message || "Account deletion failed");
      }

      setUser(null);
      clearStoredAuth();

      navigate("/login", { replace: true });

      return true;
    } catch (error) {
      console.error("Account deletion error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Account deletion failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
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
    deleteAccount,
    googleSignIn,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
