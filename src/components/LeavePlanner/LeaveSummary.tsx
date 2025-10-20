import React from "react";
import { LeaveSummary as LeaveSummaryType } from "../../types/leave";

interface LeaveSummaryProps {
  summary: LeaveSummaryType;
}

export const LeaveSummary: React.FC<LeaveSummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-blue-600">
          {summary.allowance}
        </div>
        <div className="text-sm text-gray-600">Allowance (working days)</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-yellow-600">
          {summary.pending}
        </div>
        <div className="text-sm text-gray-600">Pending Approval</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-green-600">
          {summary.deductible}
        </div>
        <div className="text-sm text-gray-600">Deductible</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="text-2xl font-bold text-purple-600">
          {summary.nonDeductible}
        </div>
        <div className="text-sm text-gray-600">Not Deductible</div>
      </div>
    </div>
  );
};
