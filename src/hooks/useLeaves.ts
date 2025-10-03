import { useState, useEffect } from 'react';
import { LeaveRequest, LeaveType, LeaveStatus } from '../types/leave';

export const useLeaves = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    { id: '1', name: 'Vacation', color: '#3B82F6', deductible: true },
    { id: '2', name: 'Sick Leave', color: '#10B981', deductible: false },
    { id: '3', name: 'Maternity', color: '#8B5CF6', deductible: false },
    { id: '4', name: 'Unpaid', color: '#6B7280', deductible: false },
  ]);

  const addLeave = (leave: Omit<LeaveRequest, 'id' | 'createdAt'>) => {
    const newLeave: LeaveRequest = {
      ...leave,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setLeaves(prev => [...prev, newLeave]);
  };

  const updateLeaveStatus = (leaveId: string, status: LeaveStatus) => {
    setLeaves(prev => prev.map(leave =>
      leave.id === leaveId ? { ...leave, status } : leave
    ));
  };

  return {
    leaves,
    leaveTypes,
    addLeave,
    updateLeaveStatus,
    setLeaveTypes,
  };
};