import React, { useState } from "react";
import {
  CompanyLeaveRequest,
  User,
  LeaveType,
  LeaveStatus,
} from "../../types/leave";
import { Button } from "@/components/ui/button";
import { formatDate } from "../../utils/dateUtils";

interface CompanyLeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leave: Omit<CompanyLeaveRequest, "id" | "createdAt">) => void;
  leaveTypes: LeaveType[];
  users: User[];
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialUser?: User;
  isEdit?: boolean;
  existingLeave?: CompanyLeaveRequest;
}

export const CompanyLeaveForm: React.FC<CompanyLeaveFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveTypes,
  users,
  initialStartDate,
  initialEndDate,
  initialUser,
  isEdit = false,
  existingLeave,
}) => {
  const [formData, setFormData] = useState({
    userId: initialUser?.id || users[0]?.id || "",
    startDate: initialStartDate
      ? formatDate(initialStartDate)
      : formatDate(new Date()),
    endDate: initialEndDate
      ? formatDate(initialEndDate)
      : formatDate(new Date()),
    typeId: existingLeave?.type.id || leaveTypes[0]?.id || "",
    reason: existingLeave?.reason || "",
    isHalfDayStart: existingLeave?.isHalfDayStart || false,
    isHalfDayEnd: existingLeave?.isHalfDayEnd || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const leaveType = leaveTypes.find((lt) => lt.id === formData.typeId);
    const user = users.find((u) => u.id === formData.userId);

    if (!leaveType || !user) return;

    const leaveData: Omit<CompanyLeaveRequest, "id" | "createdAt"> = {
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      type: leaveType,
      status: existingLeave?.status || LeaveStatus.APPROVED,
      reason: formData.reason,
      isHalfDayStart: formData.isHalfDayStart,
      isHalfDayEnd: formData.isHalfDayEnd,
      userId: formData.userId,
      user: user,
      canEdit: true,
      canApprove: true,
      canDelete: true,
    };

    onSubmit(leaveData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            {isEdit ? "Edit Leave" : "Create Leave"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={formData.userId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userId: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              required
              disabled={isEdit} // Can't change user when editing
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isHalfDayStart}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isHalfDayStart: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              Half Day Start
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isHalfDayEnd}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isHalfDayEnd: e.target.checked,
                  }))
                }
                className="mr-2"
              />
              Half Day End
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              value={formData.typeId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, typeId: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              required
            >
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason {!isEdit && "(Optional)"}
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              rows={3}
              required={isEdit}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              {isEdit ? "Update Leave" : "Create Leave"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
