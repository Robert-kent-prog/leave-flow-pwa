import { useState, useEffect } from 'react';
import { CompanyLeaveRequest, User, LeaveType, LeaveStatus, Permission } from '../types/leave';
import { useLeaves } from './useLeaves';
// Default permissions for safety
const defaultPermissions: Permission = {
  viewLeaves: false,
  manageLeaves: false,
};

export const useCompanyLeaves = (currentUserPermissions?: Permission) => {
  // Use provided permissions or default
  const permissions = currentUserPermissions || defaultPermissions;
  const { leaveTypes, setLeaveTypes } = useLeaves();
  const [companyLeaves, setCompanyLeaves] = useState<CompanyLeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john@company.com', department: 'Engineering' },
      { id: '2', name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing' },
      { id: '3', name: 'Mike Johnson', email: 'mike@company.com', department: 'Sales' },
      { id: '4', name: 'Sarah Wilson', email: 'sarah@company.com', department: 'HR' },
    ];

    const mockLeaves: CompanyLeaveRequest[] = [
      {
        id: '1',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-20'),
        type: leaveTypes[0],
        status: LeaveStatus.APPROVED,
        reason: 'Winter vacation',
        isHalfDayStart: false,
        isHalfDayEnd: false,
        userId: '1',
        user: mockUsers[0],
        createdAt: new Date('2024-12-01'),
        canEdit: permissions.manageLeaves, // Use permissions from parameter
        canApprove: permissions.manageLeaves,
        canDelete: permissions.manageLeaves,
      },
      {
        id: '2',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-10'),
        type: leaveTypes[1],
        status: LeaveStatus.PENDING,
        reason: 'Doctor appointment',
        isHalfDayStart: true,
        isHalfDayEnd: true,
        userId: '2',
        user: mockUsers[1],
        createdAt: new Date('2024-12-15'),
        canEdit: permissions.manageLeaves,
        canApprove: permissions.manageLeaves,
        canDelete: permissions.manageLeaves,
      },
    ];

    setUsers(mockUsers);
    setCompanyLeaves(mockLeaves);
  }, [leaveTypes, permissions]); 

  const addLeave = (leave: Omit<CompanyLeaveRequest, 'id' | 'createdAt'>) => {
    const newLeave: CompanyLeaveRequest = {
      ...leave,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setCompanyLeaves(prev => [...prev, newLeave]);
  };

  const updateLeave = (leaveId: string, updates: Partial<CompanyLeaveRequest>) => {
    setCompanyLeaves(prev => prev.map(leave =>
      leave.id === leaveId ? { ...leave, ...updates } : leave
    ));
  };

  const deleteLeave = (leaveId: string) => {
    setCompanyLeaves(prev => prev.filter(leave => leave.id !== leaveId));
  };

  const approveLeave = (leaveId: string) => {
    updateLeave(leaveId, { status: LeaveStatus.APPROVED });
  };

  const rejectLeave = (leaveId: string) => {
    updateLeave(leaveId, { status: LeaveStatus.REJECTED });
  };

  const revokeLeave = (leaveId: string) => {
    updateLeave(leaveId, { status: LeaveStatus.PENDING });
  };

  const getFilteredLeaves = (): CompanyLeaveRequest[] => {
    if (selectedUser === 'all') return companyLeaves;
    return companyLeaves.filter(leave => leave.userId === selectedUser);
  };

  return {
    companyLeaves: getFilteredLeaves(),
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
    hasManageLeavesPermission: permissions?.manageLeaves || true, // Add optional chaining
    hasViewLeavesPermission: permissions?.viewLeaves || true,
    permissions,
  };
};