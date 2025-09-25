import { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);
const months = [
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

const leaveTypes = [
  "Annual Leave",
  "Sick Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Compassionate Leave",
  "Other",
];

export default function LeaveSchedule() {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Leave Schedule
          </h1>
          <p className="text-muted-foreground">
            Plan and schedule employee leave requests
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-hover">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Leave
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Month
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Leave Type
              </label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All leave types" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Leave Calendar - {selectedYear}{" "}
            {selectedMonth ? months[parseInt(selectedMonth)] : "All Months"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              Interactive Calendar Coming Soon
            </h3>
            <p>This will display an interactive calendar showing:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Employee leave schedules</li>
              <li>• Multi-day selection for leave planning</li>
              <li>• Weekend exclusion from leave counts</li>
              <li>• Real-time leave duration calculation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">12</div>
                <p className="text-sm text-muted-foreground">
                  Employees on Leave Today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">23</div>
                <p className="text-sm text-muted-foreground">
                  Pending Approvals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">156</div>
                <p className="text-sm text-muted-foreground">
                  Approved This Month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
