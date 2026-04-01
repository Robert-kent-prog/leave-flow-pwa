import { useMemo } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Users,
} from "lucide-react";
import {
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEmployeesDirectory } from "@/hooks/useEmployeesDirectory";
import { useLeaveRecords } from "@/hooks/useLeaveRecords";
import { useAuth } from "@/hooks/useAuth";
import { isHrRole } from "@/lib/roles";
import type { ApiLeaveRecord } from "@/types/api";

const parseRecordDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getEffectiveCreatedDate = (record: ApiLeaveRecord) =>
  parseRecordDate(record.applicationDate) ||
  parseRecordDate(record.createdAt) ||
  parseRecordDate(record.startDate);

const isOnLeaveToday = (record: ApiLeaveRecord, today: Date) => {
  const startDate = parseRecordDate(record.startDate);
  const endDate = parseRecordDate(record.endDate);

  if (!startDate || !endDate || record.status !== "approved") {
    return false;
  }

  return isWithinInterval(today, { start: startDate, end: endDate });
};

const formatDisplayDate = (value?: string) => {
  const parsed = parseRecordDate(value);
  return parsed ? format(parsed, "PPP") : "Not set";
};

const hasSubmissionProfile = (user?: {
  phone?: string;
  designation?: string;
  dutyStation?: string;
} | null) => Boolean(user?.phone && user.designation && user.dutyStation);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHrWorkspace = isHrRole(user?.role);
  const today = useMemo(() => new Date(), []);

  const employeesQuery = useEmployeesDirectory(isHrWorkspace);
  const leaveRecordsQuery = useLeaveRecords(undefined, {
    scope: isHrWorkspace ? "all" : "mine",
  });

  const employees = useMemo(() => employeesQuery.data ?? [], [employeesQuery.data]);
  const leaveRecords = useMemo(
    () => leaveRecordsQuery.data ?? [],
    [leaveRecordsQuery.data],
  );

  const recentRequests = useMemo(
    () =>
      [...leaveRecords]
        .sort((a, b) => {
          const left = getEffectiveCreatedDate(a)?.getTime() ?? 0;
          const right = getEffectiveCreatedDate(b)?.getTime() ?? 0;
          return right - left;
        })
        .slice(0, 5),
    [leaveRecords],
  );

  const personalMetrics = useMemo(() => {
    const pendingRequests = leaveRecords.filter(
      (record) => record.status === "pending",
    ).length;
    const approvedRequests = leaveRecords.filter(
      (record) => record.status === "approved",
    ).length;
    const approvedDays = leaveRecords
      .filter((record) => record.status === "approved")
      .reduce((total, record) => total + (record.days || 0), 0);
    const currentLeave = leaveRecords.find((record) =>
      isOnLeaveToday(record, today),
    );
    const nextLeave = [...leaveRecords]
      .filter((record) => {
        const startDate = parseRecordDate(record.startDate);
        return (
          startDate &&
          startDate >= today &&
          (record.status === "approved" || record.status === "pending")
        );
      })
      .sort((a, b) => {
        const left = parseRecordDate(a.startDate)?.getTime() ?? 0;
        const right = parseRecordDate(b.startDate)?.getTime() ?? 0;
        return left - right;
      })[0];

    return {
      pendingRequests,
      approvedRequests,
      approvedDays,
      currentLeave,
      nextLeave,
    };
  }, [leaveRecords, today]);

  const metrics = useMemo(() => {
    const monthWindow = {
      start: startOfMonth(today),
      end: endOfMonth(today),
    };

    const approvedThisMonth = leaveRecords.filter((record) => {
      const referenceDate =
        parseRecordDate(record.reviewedAt) || getEffectiveCreatedDate(record);

      return (
        record.status === "approved" &&
        referenceDate &&
        isWithinInterval(referenceDate, monthWindow)
      );
    }).length;

    const pendingRequests = leaveRecords.filter(
      (record) => record.status === "pending",
    ).length;

    const activeToday = leaveRecords.filter((record) =>
      isOnLeaveToday(record, today),
    ).length;

    const approvedCount = leaveRecords.filter(
      (record) => record.status === "approved",
    ).length;

    const approvalRate = leaveRecords.length
      ? Math.round((approvedCount / leaveRecords.length) * 100)
      : 0;

    return {
      totalEmployees: employees.length,
      pendingRequests,
      approvedThisMonth,
      activeToday,
      approvalRate,
    };
  }, [employees.length, leaveRecords, today]);

  const activeStations = useMemo(() => {
    const stationCounts = leaveRecords.reduce<Record<string, number>>(
      (accumulator, record) => {
        if (!record.dutyStation || record.status !== "approved") {
          return accumulator;
        }

        accumulator[record.dutyStation] =
          (accumulator[record.dutyStation] || 0) + 1;
        return accumulator;
      },
      {},
    );

    return Object.entries(stationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [leaveRecords]);

  if (!isHrWorkspace) {
    if (leaveRecordsQuery.isError) {
      return (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle>Dashboard Unavailable</CardTitle>
            <CardDescription>
              Your leave history could not be loaded from the backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => leaveRecordsQuery.refetch()}>
              Reload Requests
            </Button>
          </CardContent>
        </Card>
      );
    }

    const personalCards = [
      {
        title: "Pending Requests",
        value: leaveRecordsQuery.isLoading ? "..." : personalMetrics.pendingRequests,
        description: "Requests still waiting for HR review",
        icon: Clock3,
      },
      {
        title: "Approved Requests",
        value: leaveRecordsQuery.isLoading ? "..." : personalMetrics.approvedRequests,
        description: "Requests approved by HR",
        icon: CheckCircle2,
      },
      {
        title: "Approved Leave Days",
        value: leaveRecordsQuery.isLoading ? "..." : personalMetrics.approvedDays,
        description: "Working days already approved",
        icon: Calendar,
      },
      {
        title: personalMetrics.currentLeave ? "Current Status" : "Next Leave",
        value: leaveRecordsQuery.isLoading
          ? "..."
          : personalMetrics.currentLeave
          ? "On leave"
          : personalMetrics.nextLeave
            ? format(parseISO(personalMetrics.nextLeave.startDate), "MMM d")
            : "None",
        description: personalMetrics.currentLeave
          ? `${format(parseISO(personalMetrics.currentLeave.startDate), "MMM d")} to ${format(parseISO(personalMetrics.currentLeave.endDate), "MMM d")}`
          : personalMetrics.nextLeave
            ? `${personalMetrics.nextLeave.leaveType} request`
            : "No upcoming leave booked",
        icon: FileText,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back, {user?.username}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your leave status, submit requests, and keep your profile
              ready for HR review.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/history")}>
              View history
            </Button>
            <Button size="sm" onClick={() => navigate("/request")}>
              Submit leave request
            </Button>
          </div>
        </div>

        {!hasSubmissionProfile(user) && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30">
            <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Complete your profile before your next submission.
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Your leave request uses the phone number, designation, and duty
                  station stored on your account.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:text-amber-200"
                onClick={() => navigate("/profile")}
              >
                Update profile
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {personalCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-start justify-between p-5">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>
                  Your latest leave submissions and current review status.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {leaveRecordsQuery.isLoading ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Loading your requests...
                </div>
              ) : recentRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  You have not submitted any leave requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground capitalize">
                          {request.leaveType} leave
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.days} working days •{" "}
                          {format(parseISO(request.startDate), "MMM d")} to{" "}
                          {format(parseISO(request.endDate), "MMM d")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Submitted{" "}
                          {formatDisplayDate(
                            request.applicationDate || request.createdAt,
                          )}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "approved"
                            ? "default"
                            : request.status === "pending"
                              ? "secondary"
                              : request.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                        className="capitalize"
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile On Record</CardTitle>
              <CardDescription>
                These details are reused automatically when you submit leave.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Staff ID</p>
                <p className="mt-1 text-lg font-semibold">{user?.staffId}</p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="mt-1 text-lg font-semibold">
                  {user?.designation || "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Duty Station</p>
                <p className="mt-1 text-lg font-semibold">
                  {user?.dutyStation || "Not set"}
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="mt-1 text-lg font-semibold">
                  {user?.phone || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Employees",
      value: metrics.totalEmployees,
      description: "Employee accounts currently active in the system",
      icon: Users,
    },
    {
      title: "Pending Requests",
      value: metrics.pendingRequests,
      description: "Requests waiting for review",
      icon: Clock3,
    },
    {
      title: "Approved This Month",
      value: metrics.approvedThisMonth,
      description: `Approved between ${format(startOfMonth(today), "MMM d")} and ${format(
        endOfMonth(today),
        "MMM d",
      )}`,
      icon: CheckCircle2,
    },
    {
      title: "Employees Away Today",
      value: metrics.activeToday,
      description: "Approved leave overlapping today",
      icon: Calendar,
    },
  ];

  const isLoading = leaveRecordsQuery.isLoading || employeesQuery.isLoading;
  const hasError = leaveRecordsQuery.isError || employeesQuery.isError;

  if (hasError) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>Dashboard Unavailable</CardTitle>
          <CardDescription>
            The dashboard could not load live employee and leave data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => leaveRecordsQuery.refetch()}>Reload Requests</Button>
          <Button variant="outline" onClick={() => employeesQuery.refetch()}>
            Reload Employees
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave Operations Snapshot
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live overview of staffing, leave demand, and approval activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/history")}
          >
            Review Requests
          </Button>
          <Button size="sm" onClick={() => navigate("/request")}>
            Create Request
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-start justify-between p-5">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {stat.title}
                </p>
                <div className="text-2xl font-semibold">
                  {isLoading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <stat.icon className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Recent Leave Requests</CardTitle>
              <CardDescription>
                Latest submissions and their current review status.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No leave requests have been submitted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">
                          {request.employeeName}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {request.pno}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.leaveType} • {request.days} working days •{" "}
                        {format(parseISO(request.startDate), "MMM d")} to{" "}
                        {format(parseISO(request.endDate), "MMM d")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {request.dutyStation}
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "default"
                          : request.status === "pending"
                            ? "secondary"
                            : request.status === "rejected"
                              ? "destructive"
                              : "outline"
                      }
                      className="capitalize"
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Health</CardTitle>
              <CardDescription>
                High-level indicators for approval performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="mt-1 text-3xl font-semibold">
                {isLoading ? "..." : `${metrics.approvalRate}%`}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? "..." : leaveRecords.length}
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">
                    Locations Impacted
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? "..." : activeStations.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Active Duty Stations</CardTitle>
              <CardDescription>
                Stations with the highest approved leave volume.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeStations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No approved leave activity yet.
                </p>
              ) : (
                activeStations.map(([station, count]) => (
                  <div
                    key={station}
                    className="flex items-center justify-between rounded-2xl border p-4"
                  >
                    <div>
                      <p className="font-medium">{station}</p>
                      <p className="text-sm text-muted-foreground">
                        Approved requests from this duty station
                      </p>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
