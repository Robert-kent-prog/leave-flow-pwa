import React, { useState } from "react";
import { useLeaves } from "../../hooks/useLeaves";
import { useCalendar } from "../../hooks/useCalendar";
import { calculateSummary } from "../../utils/leaveCalculations";
import { LeaveSummary } from "./LeaveSummary";
import { CalendarGrid } from "./CalendarGrid";
import { LeaveForm } from "./LeaveForm";
import { Button } from "@/components/ui/button";

export const LeavePlanner: React.FC = () => {
  const { leaves, leaveTypes, addLeave } = useLeaves();
  const { months, currentDate, navigateYear } = useCalendar();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();

  const summary = calculateSummary(leaves, leaveTypes, 20); // 20 days allowance

  const handleDateDoubleClick = (date: Date) => {
    setSelectedStartDate(date);
    setSelectedEndDate(date);
    setIsFormOpen(true);
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Year {currentDate.getFullYear()}
          </h1>

          <LeaveSummary summary={summary} />

          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <Button variant="secondary" onClick={handleAddNewClick}>
                Add New
              </Button>
              <div className="text-sm text-gray-600 italic">
                Double-click on a date cell to add a request for a leave
                starting from that date
              </div>
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
        </div>

        <CalendarGrid
          months={months}
          leaves={leaves}
          onDateDoubleClick={handleDateDoubleClick}
          onDateRangeSelect={handleDateRangeSelect}
        />

        <LeaveForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={addLeave}
          leaveTypes={leaveTypes}
          initialStartDate={selectedStartDate}
          initialEndDate={selectedEndDate}
        />
      </div>
    </div>
  );
};
