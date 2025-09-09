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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Add header with background
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 60, "F");

    // Company logo and title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("LEAVE HISTORY REPORT", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(240, 240, 240);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      40,
      { align: "center" }
    );

    // Add filters info in a box
    currentY = 70;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 30, 3, 3, "FD");

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Year: ${selectedYear} | Month: ${
        selectedMonth === "all" ? "All Months" : months[parseInt(selectedMonth)]
      } | Status: ${
        statusFilter === "all" ? "All Statuses" : statusFilter
      } | Type: ${typeFilter === "all" ? "All Types" : typeFilter}`,
      margin + 5,
      currentY + 10
    );

    doc.text(
      `Total Records: ${filteredHistory.length}`,
      margin + 5,
      currentY + 20
    );

    // Table configuration
    currentY += 40;
    const startX = margin;
    const rowHeight = 10;
    const columnWidths = [30, 25, 30, 30, 30, 15, 20, 30]; // Adjusted widths
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Draw table header
    doc.setFillColor(79, 70, 229); // Different shade for header
    doc.roundedRect(startX, currentY, tableWidth, rowHeight, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
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
      doc.text(header, currentX + 3, currentY + 7);
      currentX += columnWidths[index];
    });

    // Draw table rows
    currentY += rowHeight;

    filteredHistory.forEach((record, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;

        // Redraw header on new page
        doc.setFillColor(79, 70, 229);
        doc.roundedRect(startX, currentY, tableWidth, rowHeight, 1, 1, "F");
        doc.setTextColor(255, 255, 255);

        let headerX = startX;
        headers.forEach((header, headerIndex) => {
          doc.text(header, headerX + 3, currentY + 7);
          headerX += columnWidths[headerIndex];
        });

        currentY += rowHeight;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
      }

      // Set text color based on status
      doc.setTextColor(0, 0, 0);
      if (record.status === "Approved") {
        doc.setTextColor(0, 128, 0);
      } else if (record.status === "Rejected") {
        doc.setTextColor(220, 0, 0);
      } else if (record.status === "Pending") {
        doc.setTextColor(200, 120, 0);
      }

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");

      // Add cell content
      let cellX = startX;
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
        const maxWidth = columnWidths[dataIndex] - 4;
        const displayText = doc.splitTextToSize(data, maxWidth);

        doc.text(displayText, cellX + 2, currentY + 7);
        cellX += columnWidths[dataIndex];
      });

      // Draw row border
      doc.setDrawColor(220, 220, 220);
      doc.line(
        startX,
        currentY + rowHeight,
        startX + tableWidth,
        currentY + rowHeight
      );

      currentY += rowHeight;
    });

    // Add summary section
    currentY += 10;
    if (currentY > pageHeight - 60) {
      doc.addPage();
      currentY = margin;
    }

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.setFont(undefined, "bold");
    doc.text("SUMMARY STATISTICS", margin, currentY);
    currentY += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

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

    // Create summary boxes
    const boxWidth = (pageWidth - 2 * margin - 15) / 4;
    const boxHeight = 25;

    // Approved leaves box
    doc.setFillColor(235, 255, 235);
    doc.roundedRect(margin, currentY, boxWidth, boxHeight, 3, 3, "F");
    doc.setTextColor(0, 128, 0);
    doc.setFont(undefined, "bold");
    doc.text("APPROVED", margin + boxWidth / 2, currentY + 8, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(approvedCount.toString(), margin + boxWidth / 2, currentY + 18, {
      align: "center",
    });

    // Pending leaves box
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(
      margin + boxWidth + 5,
      currentY,
      boxWidth,
      boxHeight,
      3,
      3,
      "F"
    );
    doc.setTextColor(200, 120, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("PENDING", margin + boxWidth + 5 + boxWidth / 2, currentY + 8, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.text(
      pendingCount.toString(),
      margin + boxWidth + 5 + boxWidth / 2,
      currentY + 18,
      { align: "center" }
    );

    // Rejected leaves box
    doc.setFillColor(255, 235, 235);
    doc.roundedRect(
      margin + 2 * (boxWidth + 5),
      currentY,
      boxWidth,
      boxHeight,
      3,
      3,
      "F"
    );
    doc.setTextColor(220, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text(
      "REJECTED",
      margin + 2 * (boxWidth + 5) + boxWidth / 2,
      currentY + 8,
      { align: "center" }
    );
    doc.setFontSize(12);
    doc.text(
      rejectedCount.toString(),
      margin + 2 * (boxWidth + 5) + boxWidth / 2,
      currentY + 18,
      { align: "center" }
    );

    // Total days box
    doc.setFillColor(235, 235, 255);
    doc.roundedRect(
      margin + 3 * (boxWidth + 5),
      currentY,
      boxWidth,
      boxHeight,
      3,
      3,
      "F"
    );
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text(
      "TOTAL DAYS",
      margin + 3 * (boxWidth + 5) + boxWidth / 2,
      currentY + 8,
      { align: "center" }
    );
    doc.setFontSize(12);
    doc.text(
      totalDays.toString(),
      margin + 3 * (boxWidth + 5) + boxWidth / 2,
      currentY + 18,
      { align: "center" }
    );

    // Footer
    currentY += boxHeight + 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Confidential - For Internal Use Only", pageWidth / 2, currentY, {
      align: "center",
    });

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
