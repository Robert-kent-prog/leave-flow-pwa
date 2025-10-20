import React, { useState } from "react";
import { CompanyLeaveRequest, Permission } from "../../types/leave";
import { LeaveActions } from "./LeaveActions";
import { CalendarDay } from "../../types/leave";

interface CompanyCalendarGridProps {
  months: Array<{
    date: Date;
    days: Date[];
  }>;
  leaves: CompanyLeaveRequest[];
  permissions: Permission;
  onDateDoubleClick: (date: Date) => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  onLeaveAction: (action: string, leave: CompanyLeaveRequest) => void;
}

export const CompanyCalendarGrid: React.FC<CompanyCalendarGridProps> = ({
  months,
  leaves,
  permissions,
  onDateDoubleClick,
  onDateRangeSelect,
  onLeaveAction,
}) => {
  const [selectedLeave, setSelectedLeave] =
    useState<CompanyLeaveRequest | null>(null);
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getLeavesForDate = (date: Date): CompanyLeaveRequest[] => {
    return leaves.filter((leave) => {
      const leaveDate = new Date(leave.startDate);
      const leaveEndDate = new Date(leave.endDate);
      return date >= leaveDate && date <= leaveEndDate;
    });
  };

  const handleLeaveClick = (
    leave: CompanyLeaveRequest,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setSelectedLeave(leave);
    setActionPosition({ x: event.clientX, y: event.clientY });
  };

  const handleAction = (action: string, leave: CompanyLeaveRequest) => {
    onLeaveAction(action, leave);
    setSelectedLeave(null);
  };

  const getLeaveStatusIcon = (leave: CompanyLeaveRequest) => {
    if (leave.status === "pending") return "❓";
    return "";
  };

  const renderMonth = (month: (typeof months)[0], monthIndex: number) => {
    const firstDay = new Date(month.date.getFullYear(), monthIndex, 1).getDay();
    const daysInMonth = month.days.length;

    const emptyCells = Array(firstDay).fill(null);
    const dayCells = [...emptyCells, ...month.days];

    return (
      <div
        key={monthIndex}
        className="bg-white rounded-lg shadow-sm border p-4"
      >
        <h3 className="text-lg font-semibold mb-4">
          {monthNames[monthIndex]}, {month.date.getFullYear()}
        </h3>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}

          {dayCells.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-16" />;
            }

            const dateLeaves = getLeavesForDate(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                onDoubleClick={() => onDateDoubleClick(date)}
                className={`
                  h-16 border rounded-md p-1 cursor-pointer transition-colors
                  ${isWeekend ? "bg-gray-50" : "bg-white"}
                  ${isToday ? "border-blue-500 border-2" : "border-gray-200"}
                  hover:bg-gray-100 relative
                `}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`
                    text-sm font-medium
                    ${isWeekend ? "text-gray-400" : "text-gray-900"}
                    ${isToday ? "text-blue-600" : ""}
                  `}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="mt-1 space-y-1">
                  {dateLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      onClick={(e) => handleLeaveClick(leave, e)}
                      className={`
                        text-xs p-1 rounded text-white font-medium truncate
                        ${leave.status === "pending" ? "bg-gray-400" : ""}
                        cursor-pointer hover:opacity-80 transition-opacity
                        flex items-center gap-1
                      `}
                      style={{
                        backgroundColor:
                          leave.status === "pending"
                            ? "#9CA3AF"
                            : leave.type.color,
                      }}
                      title={`${leave.user.name}: ${leave.type.name} (${leave.status})`}
                    >
                      {leave.status === "pending" && (
                        <span className="text-red-500">❓</span>
                      )}
                      {leave.user.name.split(" ")[0]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month, index) => renderMonth(month, index))}
      </div>

      {selectedLeave && (
        <LeaveActions
          leave={selectedLeave}
          permissions={permissions}
          onAction={handleAction}
          position={actionPosition}
          onClose={() => setSelectedLeave(null)}
        />
      )}
    </>
  );
};
