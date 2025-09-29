import React, { useState } from "react";
import {
  ApiContext,
  ApiContextType,
  LeaveRequestData,
  LeaveRequestResponse,
  LeaveRequestsListResponse,
  UpdateLeaveRequestData,
  DeleteResponse,
} from "./AuthContextInstance";

const API_BASE_URL = "http://10.6.119.51:9000/api";

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Generic, type-safe API helper
  const apiRequest = async <T = unknown,>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
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
          console.warn("🔒 Token expired or invalid");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
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

  // Helper to serialize LeaveRequestData (convert Date → string)
  const serializeLeaveData = (data: LeaveRequestData) => ({
    ...data,
    startDate: data.startDate.toString().split("T")[0], // "2024-06-01"
    endDate: data.endDate.toString().split("T")[0],
  });

  // Create new leave request
  const createLeaveRequest = async (
    leaveData: LeaveRequestData
  ): Promise<LeaveRequestResponse> => {
    setIsLoading(true);
    try {
      const response = await apiRequest<LeaveRequestResponse>("/leaves", {
        method: "POST",
        body: JSON.stringify(serializeLeaveData(leaveData)),
      });
      return response;
    } catch (error) {
      console.error("Create leave request error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create leave request";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get leave requests by PNO
  const getLeaveRequestsByPno = async (
    pno: string
  ): Promise<LeaveRequestsListResponse> => {
    setIsLoading(true);
    try {
      const response = await apiRequest<LeaveRequestsListResponse>(
        `/leaves/employee/${pno}`
      );
      return response;
    } catch (error) {
      console.error("Get leave requests error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch leave requests";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get leave request by ID
  const getLeaveRequestById = async (
    id: string
  ): Promise<LeaveRequestResponse> => {
    setIsLoading(true);
    try {
      const response = await apiRequest<LeaveRequestResponse>(`/leaves/${id}`);
      return response;
    } catch (error) {
      console.error("Get leave request error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch leave request";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update leave request
  const updateLeaveRequest = async (
    id: string,
    updateData: UpdateLeaveRequestData
  ): Promise<LeaveRequestResponse> => {
    setIsLoading(true);
    try {
      // Serialize dates if present
      const serializedData = { ...updateData };
      if (serializedData.startDate instanceof Date) {
        serializedData.startDate = serializedData.startDate
          .toISOString()
          .split("T")[0];
      }
      if (serializedData.endDate instanceof Date) {
        serializedData.endDate = serializedData.endDate
          .toISOString()
          .split("T")[0];
      }

      const response = await apiRequest<LeaveRequestResponse>(`/leaves/${id}`, {
        method: "PUT",
        body: JSON.stringify(serializedData),
      });
      return response;
    } catch (error) {
      console.error("Update leave request error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update leave request";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete leave request
  const deleteLeaveRequest = async (id: string): Promise<DeleteResponse> => {
    setIsLoading(true);
    try {
      const response = await apiRequest<DeleteResponse>(`/leaves/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Delete leave request error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete leave request";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel leave request
  const cancelLeaveRequest = async (
    id: string
  ): Promise<LeaveRequestResponse> => {
    setIsLoading(true);
    try {
      const response = await apiRequest<LeaveRequestResponse>(
        `/leaves/${id}/cancel`,
        {
          method: "PATCH",
        }
      );
      return response;
    } catch (error) {
      console.error("Cancel leave request error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to cancel leave request";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: ApiContextType = {
    createLeaveRequest,
    getLeaveRequestsByPno,
    getLeaveRequestById,
    updateLeaveRequest,
    deleteLeaveRequest,
    cancelLeaveRequest,
    apiRequest,
    isLoading,
  };

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
};
