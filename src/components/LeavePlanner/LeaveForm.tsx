import React, { useState } from "react";
import { LeaveRequest, LeaveStatus, LeaveType } from "../../types/leave";
import { Button } from "@/components/ui/button";
import { formatDate } from "../../utils/dateUtils";

interface LeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leave: Omit<LeaveRequest, "id" | "createdAt">) => void;
  leaveTypes: LeaveType[];
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveTypes,
  initialStartDate,
  initialEndDate,
}) => {
  const [formData, setFormData] = useState({
    startDate: initialStartDate
      ? formatDate(initialStartDate)
      : formatDate(new Date()),
    endDate: initialEndDate
      ? formatDate(initialEndDate)
      : formatDate(new Date()),
    typeId: leaveTypes[0]?.id || "",
    reason: "",
    isHalfDayStart: false,
    isHalfDayEnd: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const leaveType = leaveTypes.find((lt) => lt.id === formData.typeId);
    if (!leaveType) return;

    onSubmit({
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      type: leaveType,
      status: LeaveStatus.PENDING,
      reason: formData.reason,
      isHalfDayStart: formData.isHalfDayStart,
      isHalfDayEnd: formData.isHalfDayEnd,
      userId: "current-user", // This would come from auth context
    });

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
          <h3 className="text-lg font-semibold">Request Leave</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              Reason (Optional)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              className="w-full p-2 border rounded-md"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
