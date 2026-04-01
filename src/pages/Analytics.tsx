import { useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  PieChart,
  Users,
} from "lucide-react";
import { format, getMonth, getYear, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEmployeesDirectory } from "@/hooks/useEmployeesDirectory";
import { useLeaveRecords } from "@/hooks/useLeaveRecords";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const chartColors = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#7c3aed", "#0f766e"];

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const leaveRecordsQuery = useLeaveRecords();
  const employeesQuery = useEmployeesDirectory();

  const leaveRecords = useMemo(
    () => leaveRecordsQuery.data ?? [],
    [leaveRecordsQuery.data],
  );
  const employees = useMemo(
    () => employeesQuery.data ?? [],
    [employeesQuery.data],
  );

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    leaveRecords.forEach((record) => {
      const parsed = parseDate(record.startDate);
      if (parsed) {
        years.add(getYear(parsed));
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [leaveRecords]);

  const stations = useMemo(() => {
    const uniqueStations = new Set<string>();
    employees.forEach((employee) => {
      if (employee.dutyStation) {
        uniqueStations.add(employee.dutyStation);
      }
    });
    leaveRecords.forEach((record) => {
      if (record.dutyStation) {
        uniqueStations.add(record.dutyStation);
      }
    });
    return Array.from(uniqueStations).sort();
  }, [employees, leaveRecords]);

  const filteredRecords = useMemo(
    () =>
      leaveRecords.filter((record) => {
        const parsed = parseDate(record.startDate);
        if (!parsed) {
          return false;
        }

        const yearMatch =
          selectedYear === "all" || getYear(parsed).toString() === selectedYear;
        const monthMatch =
          selectedMonth === "all" ||
          getMonth(parsed).toString() === selectedMonth;
        const stationMatch =
          selectedStation === "all" || record.dutyStation === selectedStation;

        return yearMatch && monthMatch && stationMatch;
      }),
    [leaveRecords, selectedMonth, selectedStation, selectedYear],
  );

  const metrics = useMemo(() => {
    const approved = filteredRecords.filter((record) => record.status === "approved")
      .length;
    const employeesImpacted = new Set(filteredRecords.map((record) => record.pno))
      .size;
    const totalDays = filteredRecords.reduce(
      (sum, record) => sum + (record.days || 0),
      0,
    );

    return {
      totalRequests: filteredRecords.length,
      approvalRate: filteredRecords.length
        ? Math.round((approved / filteredRecords.length) * 100)
        : 0,
      employeesImpacted,
      averageDays: filteredRecords.length
        ? Number((totalDays / filteredRecords.length).toFixed(1))
        : 0,
    };
  }, [filteredRecords]);

  const monthlyTrendData = useMemo(() => {
    const targetYear =
      selectedYear === "all"
        ? availableYears[0] || new Date().getFullYear()
        : Number(selectedYear);

    return monthLabels.map((label, monthIndex) => {
      const recordsInMonth = leaveRecords.filter((record) => {
        const parsed = parseDate(record.startDate);
        if (!parsed || getYear(parsed) !== targetYear) {
          return false;
        }

        const stationMatch =
          selectedStation === "all" || record.dutyStation === selectedStation;

        return getMonth(parsed) === monthIndex && stationMatch;
      });

      return {
        month: label,
        requests: recordsInMonth.length,
        approved: recordsInMonth.filter((record) => record.status === "approved")
          .length,
      };
    });
  }, [availableYears, leaveRecords, selectedStation, selectedYear]);

  const leaveTypeData = useMemo(() => {
    const counts = filteredRecords.reduce<Record<string, number>>((accumulator, record) => {
      accumulator[record.leaveType] = (accumulator[record.leaveType] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: chartColors[index % chartColors.length],
    }));
  }, [filteredRecords]);

  const statusBreakdown = useMemo(() => {
    const counts = filteredRecords.reduce<Record<string, number>>((accumulator, record) => {
      accumulator[record.status] = (accumulator[record.status] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [filteredRecords]);

  const stationBreakdown = useMemo(() => {
    const counts = filteredRecords.reduce<Record<string, number>>((accumulator, record) => {
      const key = record.dutyStation || "Unspecified";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [filteredRecords]);

  const isLoading = leaveRecordsQuery.isLoading || employeesQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Live Leave Analytics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Explore real leave activity across time, leave types, and duty stations.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow analytics by year, month, and duty station.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {monthLabels.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {format(new Date(2024, index, 1), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duty Station</label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="All stations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stations</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station} value={station}>
                      {station}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : metrics.totalRequests}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Approval Rate</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : `${metrics.approvalRate}%`}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Employees Impacted</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : metrics.employeesImpacted}
              </p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Average Days / Request</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : metrics.averageDays}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Request Trend</CardTitle>
            <CardDescription>
              Total versus approved requests for the selected year.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="requests" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Type Distribution</CardTitle>
            <CardDescription>
              Breakdown of request volume by leave type.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {leaveTypeData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
                No leave records match the current filters.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={leaveTypeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                  >
                    {leaveTypeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              Request volume by review outcome.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {statusBreakdown.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No records are available for the current filters.
              </div>
            ) : (
              statusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="rounded-2xl border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium capitalize">{item.status}</p>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Requests currently marked as {item.status}.
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Duty Stations</CardTitle>
            <CardDescription>
              Highest request volume under the current filters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stationBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No duty station data is available yet.
              </p>
            ) : (
              stationBreakdown.map(([station, count]) => (
                <div
                  key={station}
                  className="flex items-center justify-between rounded-2xl border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <BriefcaseBusiness className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{station}</p>
                      <p className="text-sm text-muted-foreground">
                        Request volume
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
