import React from "react";
import { CalendarDay, LeaveRequest } from "../../types/leave";

interface CalendarGridProps {
  months: Array<{
    date: Date;
    days: Date[];
  }>;
  leaves: LeaveRequest[];
  onDateDoubleClick: (date: Date) => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  months,
  leaves,
  onDateDoubleClick,
  onDateRangeSelect,
}) => {
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

  const getLeavesForDate = (date: Date): LeaveRequest[] => {
    return leaves.filter(
      (leave) => date >= leave.startDate && date <= leave.endDate
    );
  };

  const renderMonth = (month: (typeof months)[0], monthIndex: number) => {
    const firstDay = new Date(month.date.getFullYear(), monthIndex, 1).getDay();
    const daysInMonth = month.days.length;

    // Add empty cells for days before the first day of the month
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
              return <div key={index} className="h-12" />;
            }

            const dateLeaves = getLeavesForDate(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                onDoubleClick={() => onDateDoubleClick(date)}
                className={`
                  h-12 border rounded-md p-1 cursor-pointer transition-colors
                  ${isWeekend ? "bg-gray-50" : "bg-white"}
                  ${isToday ? "border-blue-500 border-2" : "border-gray-200"}
                  hover:bg-gray-100
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

                <div className="flex flex-wrap gap-1 mt-1">
                  {dateLeaves.slice(0, 2).map((leave) => (
                    <div
                      key={leave.id}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: leave.type.color }}
                      title={leave.type.name}
                    />
                  ))}
                  {dateLeaves.length > 2 && (
                    <div
                      className="w-2 h-2 bg-gray-300 rounded-full"
                      title={`+${dateLeaves.length - 2} more`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {months.map((month, index) => renderMonth(month, index))}
    </div>
  );
};
