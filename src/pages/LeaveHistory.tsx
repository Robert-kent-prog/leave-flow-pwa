import { useState } from "react";
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";

interface LeaveRecord {
  id: string;
  employee: string;
  pno: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "Approved" | "Pending" | "Rejected";
  appliedDate: string;
  approvedBy?: string;
  reason: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
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

const sampleHistory: LeaveRecord[] = [
  {
    id: "1",
    employee: "John Doe",
    pno: "EMP001",
    leaveType: "Annual Leave",
    startDate: "2025-12-15",
    endDate: "2025-12-22",
    days: 6,
    status: "Approved",
    appliedDate: "2025-12-01",
    approvedBy: "HR Manager",
    reason: "Family vacation",
  },
  {
    id: "2",
    employee: "Sarah Wilson",
    pno: "EMP002",
    leaveType: "Sick Leave",
    startDate: "2025-11-20",
    endDate: "2025-11-22",
    days: 3,
    status: "Approved",
    appliedDate: "2025-11-19",
    approvedBy: "Supervisor",
    reason: "Medical treatment",
  },
  {
    id: "3",
    employee: "Michael Chen",
    pno: "EMP003",
    leaveType: "Paternity Leave",
    startDate: "2025-10-15",
    endDate: "2025-11-15",
    days: 22,
    status: "Approved",
    appliedDate: "2025-09-20",
    approvedBy: "HR Manager",
    reason: "Birth of child",
  },
  {
    id: "4",
    employee: "Emma Johnson",
    pno: "EMP004",
    leaveType: "Annual Leave",
    startDate: "2025-08-10",
    endDate: "2025-08-15",
    days: 4,
    status: "Rejected",
    appliedDate: "2025-08-08",
    reason: "Short notice request",
  },
];

export default function LeaveHistory() {
  const [history] = useState<LeaveRecord[]>(sampleHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<LeaveRecord | null>(
    null
  );

  const filteredHistory = history.filter((record) => {
    // Search term matching
    const matchesSearch =
      record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.pno.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter matching
    const matchesStatus =
      statusFilter === "all" || record.status.toLowerCase() === statusFilter;

    // Leave type filter matching
    const matchesType =
      typeFilter === "all" ||
      record.leaveType.toLowerCase().includes(typeFilter);

    // Year filter matching
    const recordYear = new Date(record.startDate).getFullYear().toString();
    const matchesYear = selectedYear === "all" || recordYear === selectedYear;

    // Month filter matching
    const recordMonth = new Date(record.startDate).getMonth().toString();
    const matchesMonth =
      selectedMonth === "all" || recordMonth === selectedMonth;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesYear &&
      matchesMonth
    );
  });

  const getStatusBadge = (status: LeaveRecord["status"]) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Leave History Report", 20, 30);

    // Add filters info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(
      `Year: ${selectedYear} | Month: ${
        selectedMonth === "all" ? "All Months" : months[parseInt(selectedMonth)]
      } | Status: ${
        statusFilter === "all" ? "All Statuses" : statusFilter
      } | Type: ${typeFilter === "all" ? "All Types" : typeFilter}`,
      20,
      45
    );
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Total Records: ${filteredHistory.length}`, 20, 65);

    // Table configuration
    const startX = 20;
    const startY = 80;
    const rowHeight = 10;
    const columnWidths = [30, 40, 30, 30, 30, 20, 25, 30]; // Widths for each column
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Draw table header
    doc.setFillColor(59, 130, 246); // Blue background for header
    doc.rect(startX, startY, tableWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255); // White text for header
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");

    let currentX = startX;
    const headers = [
      "Employee",
      "P/No",
      "Leave Type",
      "Start Date",
      "End Date",
      "Days",
      "Status",
      "Applied Date",
    ];

    headers.forEach((header, index) => {
      doc.text(header, currentX + 2, startY + 7);
      currentX += columnWidths[index];
    });

    // Draw table rows
    doc.setTextColor(0, 0, 0); // Black text for rows
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    let currentY = startY + rowHeight;

    filteredHistory.forEach((record, index) => {
      // Alternate row colors for better readability
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240); // Light gray for even rows
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
      }

      // Draw cell borders
      doc.setDrawColor(200, 200, 200); // Light gray border color
      doc.setLineWidth(0.1);

      let cellX = startX;

      // Draw vertical lines
      for (let i = 0; i <= columnWidths.length; i++) {
        doc.line(cellX, currentY, cellX, currentY + rowHeight);
        if (i < columnWidths.length) {
          cellX += columnWidths[i];
        }
      }

      // Draw horizontal line at the bottom of the row
      doc.line(
        startX,
        currentY + rowHeight,
        startX + tableWidth,
        currentY + rowHeight
      );

      // Add cell content
      cellX = startX;
      const rowData = [
        record.employee,
        record.pno,
        record.leaveType,
        formatDate(record.startDate),
        formatDate(record.endDate),
        record.days.toString(),
        record.status,
        formatDate(record.appliedDate),
      ];

      rowData.forEach((data, dataIndex) => {
        // Truncate long text to fit in cells
        const maxLength = Math.floor(columnWidths[dataIndex] / 3);
        const displayText =
          data.length > maxLength
            ? data.substring(0, maxLength - 3) + "..."
            : data;

        doc.text(displayText, cellX + 2, currentY + 7);
        cellX += columnWidths[dataIndex];
      });

      currentY += rowHeight;

      // Add new page if we're running out of space
      if (currentY > 250 && index < filteredHistory.length - 1) {
        doc.addPage();
        currentY = 20;

        // Redraw header on new page
        doc.setFillColor(59, 130, 246);
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, "bold");

        let headerX = startX;
        headers.forEach((header, headerIndex) => {
          doc.text(header, headerX + 2, currentY + 7);
          headerX += columnWidths[headerIndex];
        });

        currentY += rowHeight;
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");
      }
    });

    // Add summary section
    const summaryY = currentY + 15;
    if (summaryY < 280) {
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text("Summary Statistics", startX, summaryY);

      doc.setFontSize(10);
      const approvedCount = filteredHistory.filter(
        (r) => r.status === "Approved"
      ).length;
      const pendingCount = filteredHistory.filter(
        (r) => r.status === "Pending"
      ).length;
      const rejectedCount = filteredHistory.filter(
        (r) => r.status === "Rejected"
      ).length;
      const totalDays = filteredHistory.reduce((sum, r) => sum + r.days, 0);

      doc.text(`Approved Leaves: ${approvedCount}`, startX, summaryY + 10);
      doc.text(`Pending Leaves: ${pendingCount}`, startX, summaryY + 20);
      doc.text(`Rejected Leaves: ${rejectedCount}`, startX, summaryY + 30);
      doc.text(`Total Leave Days: ${totalDays}`, startX, summaryY + 40);
    }

    doc.save(`leave-history-${selectedYear}-${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="h-8 w-8" />
            Leave History
          </h1>
          <p className="text-muted-foreground">
            View and manage historical leave records
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by employee or P/No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="maternity">Maternity Leave</SelectItem>
                <SelectItem value="paternity">Paternity Leave</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredHistory.length} of {history.length} records
            </div>
          </div>

          {/* Additional filters from LeaveSchedule */}
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
                  <SelectItem value="all">All Years</SelectItem>
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
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSelectedYear("all");
                  setSelectedMonth("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Leave Records -{" "}
            {selectedYear === "all" ? "All Years" : selectedYear}{" "}
            {selectedMonth === "all" ? "" : months[parseInt(selectedMonth)]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>P/No</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.employee}
                  </TableCell>
                  <TableCell>{record.pno}</TableCell>
                  <TableCell>{record.leaveType}</TableCell>
                  <TableCell>
                    {formatDate(record.startDate)} -{" "}
                    {formatDate(record.endDate)}
                  </TableCell>
                  <TableCell>{record.days}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{formatDate(record.appliedDate)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Leave Request Details</DialogTitle>
                        </DialogHeader>
                        {selectedRecord && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Employee
                                </p>
                                <p className="text-sm">
                                  {selectedRecord.employee}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  P/No
                                </p>
                                <p className="text-sm">{selectedRecord.pno}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Leave Type
                                </p>
                                <p className="text-sm">
                                  {selectedRecord.leaveType}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Duration
                                </p>
                                <p className="text-sm">
                                  {selectedRecord.days} days
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Start Date
                                </p>
                                <p className="text-sm">
                                  {formatDate(selectedRecord.startDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  End Date
                                </p>
                                <p className="text-sm">
                                  {formatDate(selectedRecord.endDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Applied Date
                                </p>
                                <p className="text-sm">
                                  {formatDate(selectedRecord.appliedDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Status
                                </p>
                                {getStatusBadge(selectedRecord.status)}
                              </div>
                            </div>
                            {selectedRecord.approvedBy && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Approved By
                                </p>
                                <p className="text-sm">
                                  {selectedRecord.approvedBy}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">
                                Reason
                              </p>
                              <p className="text-sm">{selectedRecord.reason}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No leave records found matching your criteria.
              </p>
            </div>
          )}
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
