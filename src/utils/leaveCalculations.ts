import { LeaveRequest, LeaveType, LeaveSummary } from '../types/leave';
import { getWorkingDays, isWeekend } from './dateUtils';

export const calculateLeaveDays = (
  leave: LeaveRequest, 
  leaveTypes: LeaveType[]
): number => {
  const leaveType = leaveTypes.find(lt => lt.id === leave.type.id);
  if (!leaveType) return 0;

  let days = getWorkingDays(leave.startDate, leave.endDate);
  
  // Adjust for half days
  if (leave.isHalfDayStart && leave.isHalfDayEnd && 
      leave.startDate.getTime() === leave.endDate.getTime()) {
    days = 0.5;
  } else {
    if (leave.isHalfDayStart) days -= 0.5;
    if (leave.isHalfDayEnd) days -= 0.5;
  }
  
  return Math.max(days, 0);
};

export const calculateSummary = (
  leaves: LeaveRequest[], 
  leaveTypes: LeaveType[], 
  allowance: number
): LeaveSummary => {
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
  const approvedLeaves = leaves.filter(leave => leave.status === 'approved');
  
  const deductibleUsed = approvedLeaves
    .filter(leave => leaveTypes.find(lt => lt.id === leave.type.id)?.deductible)
    .reduce((sum, leave) => sum + calculateLeaveDays(leave, leaveTypes), 0);
  
  const nonDeductibleUsed = approvedLeaves
    .filter(leave => !leaveTypes.find(lt => lt.id === leave.type.id)?.deductible)
    .reduce((sum, leave) => sum + calculateLeaveDays(leave, leaveTypes), 0);
  
  const pendingDays = pendingLeaves
    .reduce((sum, leave) => sum + calculateLeaveDays(leave, leaveTypes), 0);
  
  return {
    allowance,
    pending: pendingDays,
    deductible: deductibleUsed,
    nonDeductible: nonDeductibleUsed,
    used: deductibleUsed + nonDeductibleUsed,
    remaining: allowance - deductibleUsed
  };
};