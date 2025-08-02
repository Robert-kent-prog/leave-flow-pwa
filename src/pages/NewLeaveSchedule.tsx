import { useState } from "react";
import { Calendar, Clock, Users, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface LeaveEvent {
  id: string;
  employee: string;
  type: "Annual" | "Sick" | "Maternity" | "Paternity" | "Other";
  startDate: Date;
  endDate: Date;
  days: number;
  status: "Approved" | "Pending" | "Rejected";
}

const sampleEvents: LeaveEvent[] = [
  {
    id: "1",
    employee: "John Doe",
    type: "Annual",
    startDate: new Date(2024, 11, 15),
    endDate: new Date(2024, 11, 22),
    days: 6,
    status: "Approved",
  },
  {
    id: "2",
    employee: "Sarah Wilson",
    type: "Sick",
    startDate: new Date(2024, 11, 12),
    endDate: new Date(2024, 11, 13),
    days: 2,
    status: "Approved",
  },
];

export default function LeaveSchedule() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("12");
  const [selectedLeaveType, setSelectedLeaveType] = useState("all");
  const [events] = useState<LeaveEvent[]>(sampleEvents);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const currentMonth = parseInt(selectedMonth) - 1;
  const currentYear = parseInt(selectedYear);

  const filteredEvents = events.filter((event) => {
    const eventMonth = event.startDate.getMonth();
    const eventYear = event.startDate.getFullYear();
    const typeMatch =
      selectedLeaveType === "all" ||
      event.type.toLowerCase() === selectedLeaveType;

    return (
      eventYear === currentYear && eventMonth === currentMonth && typeMatch
    );
  });

  const getLeaveTypeBadge = (type: LeaveEvent["type"]) => {
    const colors = {
      Annual: "bg-blue-100 text-blue-800",
      Sick: "bg-red-100 text-red-800",
      Maternity: "bg-green-100 text-green-800",
      Paternity: "bg-yellow-100 text-yellow-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const getStatusBadge = (status: LeaveEvent["status"]) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (start.getTime() === end.getTime()) {
      return start.toLocaleDateString("en-US", options);
    }
    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}`;
  };

  // Calculate total leave days for the month
  const totalLeaveDays = filteredEvents.reduce(
    (sum, event) => sum + event.days,
    0
  );
  const uniqueEmployeesOnLeave = new Set(
    filteredEvents.map((event) => event.employee)
  ).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Schedule</h1>
          <p className="text-muted-foreground">
            View and manage employee leave schedules
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Leave
        </Button>
      </div>

      {/* Filters and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Leave Type</label>
                <Select
                  value={selectedLeaveType}
                  onValueChange={setSelectedLeaveType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="sick">Sick</SelectItem>
                    <SelectItem value="maternity">Maternity</SelectItem>
                    <SelectItem value="paternity">Paternity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Month Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Leave Days
                </p>
                <p className="text-2xl font-bold">{totalLeaveDays}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Employees on Leave
                </p>
                <p className="text-2xl font-bold">{uniqueEmployeesOnLeave}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No leave events found for the selected filters.
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.employee}</h4>
                        {getStatusBadge(event.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getLeaveTypeBadge(event.type)}
                        <span className="text-sm text-muted-foreground">
                          {formatDateRange(event.startDate, event.endDate)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Duration: {event.days} day{event.days !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
