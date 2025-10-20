import React from "react";
import {
  CompanyLeaveRequest,
  LeaveAction,
  LeaveStatus,
  Permission,
} from "../../types/leave";

interface LeaveActionsProps {
  leave: CompanyLeaveRequest;
  permissions: Permission;
  onAction: (action: LeaveAction["type"], leave: CompanyLeaveRequest) => void;
  position: { x: number; y: number };
  onClose: () => void;
}

export const LeaveActions: React.FC<LeaveActionsProps> = ({
  leave,
  permissions,
  onAction,
  position,
  onClose,
}) => {
  const actions: LeaveAction[] = [
    {
      type: "edit",
      label: "Edit Leave",
      icon: "✏️",
      condition: (l, p) => p.manageLeaves && l.status !== LeaveStatus.APPROVED,
    },
    {
      type: "approve",
      label: "Approve",
      icon: "✅",
      condition: (l, p) => p.manageLeaves && l.status === LeaveStatus.PENDING,
    },
    {
      type: "reject",
      label: "Reject",
      icon: "❌",
      condition: (l, p) => p.manageLeaves && l.status === LeaveStatus.PENDING,
    },
    {
      type: "revoke",
      label: "Revoke Approval",
      icon: "↩️",
      condition: (l, p) => p.manageLeaves && l.status === LeaveStatus.APPROVED,
    },
    {
      type: "delete",
      label: "Delete",
      icon: "🗑️",
      condition: (l, p) => p.manageLeaves && l.status !== LeaveStatus.APPROVED,
    },
  ];

  const availableActions = actions.filter((action) =>
    action.condition(leave, permissions)
  );

  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClose]);

  if (availableActions.length === 0) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-48"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-2">
        <div className="text-sm font-medium text-gray-900 mb-2 border-b pb-2">
          {leave.user.name} - {leave.type.name}
        </div>
        {availableActions.map((action) => (
          <button
            key={action.type}
            onClick={() => onAction(action.type, leave)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
          >
            <span>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
