import { useMemo, useState } from "react";
import {
  endOfMonth,
  format,
  getMonth,
  getYear,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useEmployeesDirectory } from "@/hooks/useEmployeesDirectory";
import { useLeaveRecords } from "@/hooks/useLeaveRecords";
import type { ApiLeaveRecord } from "@/types/api";

const currentYear = new Date().getFullYear();
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

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: string) => {
  const parsed = parseDate(value);
  return parsed ? format(parsed, "PPP") : "Not set";
};

const getStatusBadge = (status: ApiLeaveRecord["status"]) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>;
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "cancelled":
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const escapeCsvValue = (value: string | number | undefined) => {
  const serialized = String(value ?? "");
  return `"${serialized.replace(/"/g, '""')}"`;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default function LeaveReports() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedStation, setSelectedStation] = useState("all");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const leaveRecordsQuery = useLeaveRecords(undefined, { scope: "all" });
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
      const startDate = parseDate(record.startDate);
      if (startDate) {
        years.add(getYear(startDate));
      }
    });
    return Array.from(years).sort((left, right) => right - left);
  }, [leaveRecords]);

  const leaveTypes = useMemo(
    () => Array.from(new Set(leaveRecords.map((record) => record.leaveType))).sort(),
    [leaveRecords],
  );

  const stations = useMemo(() => {
    const values = new Set<string>();

    employees.forEach((employee) => {
      if (employee.dutyStation) {
        values.add(employee.dutyStation);
      }
    });

    leaveRecords.forEach((record) => {
      if (record.dutyStation) {
        values.add(record.dutyStation);
      }
    });

    return Array.from(values).sort();
  }, [employees, leaveRecords]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return leaveRecords.filter((record) => {
      const startDate = parseDate(record.startDate);
      if (!startDate) {
        return false;
      }

      const matchesSearch =
        normalizedSearch.length === 0 ||
        record.employeeName.toLowerCase().includes(normalizedSearch) ||
        record.pno.toLowerCase().includes(normalizedSearch) ||
        record.leaveType.toLowerCase().includes(normalizedSearch) ||
        record.reason.toLowerCase().includes(normalizedSearch) ||
        (record.designation || "").toLowerCase().includes(normalizedSearch) ||
        (record.dutyStation || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;
      const matchesType = typeFilter === "all" || record.leaveType === typeFilter;
      const matchesYear =
        selectedYear === "all" || getYear(startDate).toString() === selectedYear;
      const matchesMonth =
        selectedMonth === "all" ||
        getMonth(startDate).toString() === selectedMonth;
      const matchesStation =
        selectedStation === "all" || record.dutyStation === selectedStation;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesYear &&
        matchesMonth &&
        matchesStation
      );
    });
  }, [
    leaveRecords,
    searchTerm,
    statusFilter,
    typeFilter,
    selectedYear,
    selectedMonth,
    selectedStation,
  ]);

  const reportMetrics = useMemo(() => {
    const today = new Date();
    const currentMonthWindow = {
      start: startOfMonth(today),
      end: endOfMonth(today),
    };

    const employeesInScope = new Set(filteredRecords.map((record) => record.pno)).size;
    const pendingApprovals = filteredRecords.filter(
      (record) => record.status === "pending",
    ).length;
    const approvedThisMonth = filteredRecords.filter((record) => {
      const reviewedAt = parseDate(record.reviewedAt);
      return (
        record.status === "approved" &&
        reviewedAt &&
        isWithinInterval(reviewedAt, currentMonthWindow)
      );
    }).length;
    const leaveDays = filteredRecords.reduce(
      (total, record) => total + (record.days || 0),
      0,
    );

    return {
      employeesInScope,
      pendingApprovals,
      approvedThisMonth,
      leaveDays,
    };
  }, [filteredRecords]);

  const topLeaveTypes = useMemo(() => {
    const counts = filteredRecords.reduce<Record<string, number>>(
      (accumulator, record) => {
        accumulator[record.leaveType] = (accumulator[record.leaveType] || 0) + 1;
        return accumulator;
      },
      {},
    );

    return Object.entries(counts)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4);
  }, [filteredRecords]);

  const sortedRecords = useMemo(
    () =>
      [...filteredRecords].sort((left, right) => {
        const leftDate = parseDate(left.startDate)?.getTime() ?? 0;
        const rightDate = parseDate(right.startDate)?.getTime() ?? 0;
        return rightDate - leftDate;
      }),
    [filteredRecords],
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSelectedYear("all");
    setSelectedMonth("all");
    setSelectedStation("all");
  };

  const exportToCsv = async () => {
    if (sortedRecords.length === 0) {
      toast.error("No records match the current report filters.");
      return;
    }

    setIsExportingCsv(true);

    try {
      const headers = [
        "Employee",
        "Staff ID",
        "Leave Type",
        "Status",
        "Start Date",
        "End Date",
        "Working Days",
        "Duty Station",
        "Submitted",
        "Reviewed",
        "Comments",
      ];

      const rows = sortedRecords.map((record) =>
        [
          record.employeeName,
          record.pno,
          record.leaveType,
          record.status,
          formatDate(record.startDate),
          formatDate(record.endDate),
          record.days,
          record.dutyStation || "",
          formatDate(record.applicationDate || record.createdAt),
          formatDate(record.reviewedAt),
          record.comments || "",
        ]
          .map(escapeCsvValue)
          .join(","),
      );

      const csv = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
      downloadBlob(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
        `leave-report-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast.success("CSV report downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "CSV export failed.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  const exportToPdf = async () => {
    if (sortedRecords.length === 0) {
      toast.error("No records match the current report filters.");
      return;
    }

    setIsExportingPdf(true);

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const footerY = pageHeight - 10;
      const columns = [
        { label: "Employee", width: 45 },
        { label: "Staff ID", width: 28 },
        { label: "Type", width: 28 },
        { label: "Status", width: 22 },
        { label: "Start", width: 28 },
        { label: "End", width: 28 },
        { label: "Days", width: 16 },
        { label: "Station", width: 40 },
      ];
      const rowHeight = 8;
      const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
      let currentPage = 1;
      let y = 20;

      const drawFooter = (page: number) => {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, footerY, pageWidth - margin, footerY);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Generated by ${user?.username || "System"} on ${format(new Date(), "PPP p")}`,
          margin,
          footerY + 5,
        );
        doc.text(`Page ${page}`, pageWidth - margin - 14, footerY + 5);
      };

      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(18, 24, 38);
        doc.setFontSize(18);
        doc.text("Leave Management Report", margin, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(90, 102, 122);
        doc.text(
          `Records: ${sortedRecords.length} | Workforce: ${employees.length} | Leave days in scope: ${reportMetrics.leaveDays}`,
          margin,
          y + 8,
        );
        doc.text(
          `Filters: ${selectedYear === "all" ? "All years" : selectedYear}, ${selectedMonth === "all" ? "All months" : months[Number(selectedMonth)]}, ${statusFilter === "all" ? "All statuses" : statusFilter}, ${typeFilter === "all" ? "All leave types" : typeFilter}, ${selectedStation === "all" ? "All stations" : selectedStation}`,
          margin,
          y + 14,
          { maxWidth: pageWidth - margin * 2 },
        );
        y += 24;
      };

      const drawTableHeader = () => {
        let x = margin;
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, tableWidth, rowHeight, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(18, 24, 38);

        columns.forEach((column) => {
          doc.rect(x, y, column.width, rowHeight);
          doc.text(column.label, x + 2, y + 5.5);
          x += column.width;
        });

        y += rowHeight;
      };

      drawHeader();
      drawTableHeader();

      sortedRecords.forEach((record, index) => {
        if (y + rowHeight > footerY - 4) {
          drawFooter(currentPage);
          doc.addPage("landscape");
          currentPage += 1;
          y = 20;
          drawHeader();
          drawTableHeader();
        }

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y, tableWidth, rowHeight, "F");
        }

        const row = [
          record.employeeName,
          record.pno,
          record.leaveType,
          record.status,
          format(parseISO(record.startDate), "dd MMM"),
          format(parseISO(record.endDate), "dd MMM"),
          String(record.days),
          record.dutyStation || "-",
        ];

        let x = margin;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(36, 41, 46);

        row.forEach((cell, cellIndex) => {
          doc.rect(x, y, columns[cellIndex].width, rowHeight);
          doc.text(cell, x + 2, y + 5.3, {
            maxWidth: columns[cellIndex].width - 4,
          });
          x += columns[cellIndex].width;
        });

        y += rowHeight;
      });

      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Summary", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Employees in scope: ${reportMetrics.employeesInScope}`, margin, y);
      doc.text(`Pending approvals: ${reportMetrics.pendingApprovals}`, margin + 60, y);
      doc.text(`Approved this month: ${reportMetrics.approvedThisMonth}`, margin + 120, y);
      doc.text(`Leave days in scope: ${reportMetrics.leaveDays}`, margin + 188, y);

      drawFooter(currentPage);
      doc.save(`leave-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("PDF report downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF export failed.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const isLoading = leaveRecordsQuery.isLoading || employeesQuery.isLoading;
  const isError = leaveRecordsQuery.isError || employeesQuery.isError;

  if (isError) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>Reports Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => leaveRecordsQuery.refetch()}>Reload leave data</Button>
          <Button variant="outline" onClick={() => employeesQuery.refetch()}>
            Reload employee data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <FileText className="h-7 w-7" />
            Leave Reports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Export live leave activity, approval outcomes, and workload trends from
            the shared HR data set.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              leaveRecordsQuery.refetch();
              employeesQuery.refetch();
            }}
            disabled={isLoading || isExportingCsv || isExportingPdf}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportToCsv}
            disabled={isLoading || isExportingCsv || sortedRecords.length === 0}
          >
            {isExportingCsv ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button
            onClick={exportToPdf}
            disabled={isLoading || isExportingPdf || sortedRecords.length === 0}
          >
            {isExportingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Tracked Employees</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : employees.length}
              </p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Employees In Scope</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : reportMetrics.employeesInScope}
              </p>
            </div>
            <Filter className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : reportMetrics.pendingApprovals}
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Leave Days In Scope</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : reportMetrics.leaveDays}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search employee, staff ID, leave type, reason, station, or designation"
                className="pl-10"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All leave types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All leave types</SelectItem>
                  {leaveTypes.map((leaveType) => (
                    <SelectItem key={leaveType} value={leaveType}>
                      {leaveType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear filters
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Year</Label>
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
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duty Station</Label>
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

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Filtered Request Log</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {sortedRecords.length} request{sortedRecords.length === 1 ? "" : "s"}{" "}
                match the current report scope.
              </p>
            </div>
            <Badge variant="secondary">
              {selectedYear === "all" ? "All years" : selectedYear}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading report data...
              </div>
            ) : sortedRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No leave requests match the current report filters.
              </div>
            ) : (
              <>
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Window</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Duty Station</TableHead>
                        <TableHead>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRecords.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {record.pno}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{formatDate(record.startDate)}</div>
                            <div className="text-sm text-muted-foreground">
                              to {formatDate(record.endDate)}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {record.leaveType}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{record.days}</TableCell>
                          <TableCell>{record.dutyStation || "Not set"}</TableCell>
                          <TableCell className="max-w-[220px] truncate">
                            {record.comments || "No review comments"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 lg:hidden">
                  {sortedRecords.map((record) => (
                    <div key={record._id} className="rounded-2xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{record.pno}</p>
                        </div>
                        {getStatusBadge(record.status)}
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatDate(record.startDate)} to {formatDate(record.endDate)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {record.leaveType} • {record.days} working days
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {record.dutyStation || "No duty station"}
                      </p>
                      <p className="mt-3 text-sm">{record.comments || "No review comments"}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                <span className="text-muted-foreground">Generated by</span>
                <span className="font-medium">{user?.username || "System"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                <span className="text-muted-foreground">Approved this month</span>
                <span className="font-medium">{reportMetrics.approvedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border px-4 py-3">
                <span className="text-muted-foreground">Current month</span>
                <span className="font-medium">{months[new Date().getMonth()]}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Top Leave Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLeaveTypes.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No leave type distribution is available for the current filters.
                </div>
              ) : (
                topLeaveTypes.map(([leaveType, count]) => (
                  <div
                    key={leaveType}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium capitalize">{leaveType}</p>
                      <p className="text-sm text-muted-foreground">
                        Requests in current scope
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
