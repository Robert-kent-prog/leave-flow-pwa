import React, { useState } from "react";
import { useCompanyLeaves } from "../../hooks/useCompanyLeaves";
import { useCalendar } from "../../hooks/useCalendar";
import { CompanyLeaveRequest, Permission } from "../../types/leave";
import { CompanyCalendarGrid } from "./CompanyCalendarGrid";
import { CompanyLeaveForm } from "./CompanyLeaveForm";
import { UserFilter } from "./UserFilter";
import { Button } from "@/components/ui/button";

interface CompanyLeavePlannerProps {
  permissions?: Permission; // Make it optional with default value
}

// Default permissions for fallback
const defaultPermissions: Permission = {
  viewLeaves: false,
  manageLeaves: false,
};

export const CompanyLeavePlanner: React.FC<CompanyLeavePlannerProps> = ({
  permissions = defaultPermissions, // Provide default value
}) => {
  const {
    companyLeaves,
    users,
    selectedUser,
    setSelectedUser,
    leaveTypes,
    addLeave,
    updateLeave,
    deleteLeave,
    approveLeave,
    rejectLeave,
    revokeLeave,
    hasManageLeavesPermission,
  } = useCompanyLeaves(permissions);

  const { months, currentDate, navigateYear } = useCalendar();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<CompanyLeaveRequest | null>(
    null
  );
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();

  // Add safety check
  if (!permissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Permissions are being loaded.</p>
        </div>
      </div>
    );
  }

  if (!permissions.viewLeaves) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to view company leaves.
          </p>
        </div>
      </div>
    );
  }

  const handleDateDoubleClick = (date: Date) => {
    if (!hasManageLeavesPermission) return;

    setSelectedStartDate(date);
    setSelectedEndDate(date);
    setEditingLeave(null);
    setIsFormOpen(true);
  };

  const handleLeaveAction = (action: string, leave: CompanyLeaveRequest) => {
    switch (action) {
      case "edit":
        setEditingLeave(leave);
        setIsFormOpen(true);
        break;
      case "approve":
        approveLeave(leave.id);
        break;
      case "reject":
        rejectLeave(leave.id);
        break;
      case "revoke":
        revokeLeave(leave.id);
        break;
      case "delete":
        if (
          window.confirm("Are you sure you want to delete this leave request?")
        ) {
          deleteLeave(leave.id);
        }
        break;
    }
  };

  const handleFormSubmit = (
    leaveData: Omit<CompanyLeaveRequest, "id" | "createdAt">
  ) => {
    if (editingLeave) {
      updateLeave(editingLeave.id, leaveData);
    } else {
      addLeave(leaveData);
    }
  };

  const handleAddNewClick = () => {
    setEditingLeave(null);
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Company Leave Planner - {currentDate.getFullYear()}
              </h1>
              <p className="text-gray-600">
                Manage leave requests for all employees
                {hasManageLeavesPermission &&
                  " - You have management permissions"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear("prev")}
              >
                Previous Year
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear("next")}
              >
                Next Year
              </Button>
            </div>
          </div>

          <UserFilter
            users={users}
            selectedUser={selectedUser}
            onUserChange={setSelectedUser}
          />

          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              {hasManageLeavesPermission && (
                <Button variant="secondary" onClick={handleAddNewClick}>
                  Add New Leave
                </Button>
              )}
              <div className="text-sm text-gray-600 italic">
                {hasManageLeavesPermission
                  ? "Double-click on a date cell to add a leave entry"
                  : "Click on leave entries to view details"}
              </div>
            </div>
          </div>
        </div>

        <CompanyCalendarGrid
          months={months}
          leaves={companyLeaves}
          permissions={permissions}
          onDateDoubleClick={handleDateDoubleClick}
          onDateRangeSelect={() => {}} // Implement drag selection if needed
          onLeaveAction={handleLeaveAction}
        />

        {hasManageLeavesPermission && (
          <CompanyLeaveForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingLeave(null);
            }}
            onSubmit={handleFormSubmit}
            leaveTypes={leaveTypes}
            users={users}
            initialStartDate={selectedStartDate}
            initialEndDate={selectedEndDate}
            isEdit={!!editingLeave}
            existingLeave={editingLeave || undefined}
          />
        )}
      </div>
    </div>
  );
};
