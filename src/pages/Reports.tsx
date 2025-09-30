import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  Clock,
  CheckCircle,
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
import { Label } from "@/components/ui/label";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface LeaveRecord {
  _id: string;
  employeeName: string;
  pno: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  appliedDate: string;
  reviewedBy?: string;
  reason: string;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // Last 5 years + next 5 years
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

export default function LeaveReports() {
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<LeaveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch leave records from backend
  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  // Apply filters whenever filters or data change
  useEffect(() => {
    applyFilters();
  }, [
    leaveRecords,
    searchTerm,
    statusFilter,
    typeFilter,
    selectedYear,
    selectedMonth,
  ]);

  const fetchLeaveRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/leaves");
      if (!response.ok) {
        throw new Error("Failed to fetch leave records");
      }
      const data = await response.json();
      setLeaveRecords(data);
    } catch (error) {
      console.error("Error fetching leave records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch leave records from the server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = leaveRecords;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employeeName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.pno.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Leave type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((record) => record.leaveType === typeFilter);
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter((record) => {
        const recordYear = new Date(record.startDate).getFullYear().toString();
        return recordYear === selectedYear;
      });
    }

    // Month filter
    if (selectedMonth !== "all") {
      filtered = filtered.filter((record) => {
        const recordMonth = new Date(record.startDate).getMonth().toString();
        return recordMonth === selectedMonth;
      });
    }

    setFilteredRecords(filtered);
  };

  const getStatusBadge = (status: LeaveRecord["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportToPDF = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "No Data",
        description: "No records to export with current filters",
        variant: "destructive",
      });
      return;
    }

    // Use landscape orientation for better space
    const doc = new jsPDF("landscape");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = margin;

    // Store page numbers for footer
    let pageCount = 1;
    const addFooter = () => {
      const footerY = pageHeight - 10;
      doc.setDrawColor(150, 150, 150);
      doc.line(margin, footerY, pageWidth - margin, footerY);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Confidential - For Internal Use Only",
        pageWidth / 2,
        footerY + 5,
        { align: "center" }
      );
      doc.text(`Page ${pageCount}`, pageWidth - margin, footerY + 5, {
        align: "right",
      });
      pageCount++;
    };

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("Leave Management Report", pageWidth / 2, 20, { align: "center" });

    // Add filters info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Year: ${selectedYear} | Month: ${
        selectedMonth === "all" ? "All Months" : months[parseInt(selectedMonth)]
      } | Status: ${
        statusFilter === "all" ? "All Statuses" : statusFilter
      } | Type: ${typeFilter === "all" ? "All Types" : typeFilter}`,
      pageWidth / 2,
      30,
      { align: "center" }
    );

    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      40,
      { align: "center" }
    );
    doc.text(`Total Records: ${filteredRecords.length}`, pageWidth / 2, 50, {
      align: "center",
    });

    // Draw a line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, 55, pageWidth - margin, 55);

    // Table configuration - with more space in landscape mode
    currentY = 65;
    const startX = margin;
    const rowHeight = 10;

    // Adjusted column widths for landscape mode - added numbering column as first column
    const columnWidths = [12, 35, 30, 30, 30, 30, 20, 25, 30]; // Added 12px for numbering column
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Draw table header with borders
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, currentY, tableWidth, rowHeight, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");

    let currentX = startX;
    const headers = [
      "#", // Numbering column header
      "Employee",
      "P/No",
      "Leave Type",
      "Start Date",
      "End Date",
      "Days",
      "Status",
      "Applied Date",
    ];

    // Draw header cells with borders
    headers.forEach((header, index) => {
      doc.rect(currentX, currentY, columnWidths[index], rowHeight);
      doc.text(header, currentX + (index === 0 ? 4 : 2), currentY + 7); // Center the # header
      currentX += columnWidths[index];
    });

    // Draw table rows
    currentY += rowHeight;
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);

    filteredRecords.forEach((record, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > pageHeight - 20) {
        addFooter(); // Add footer to current page
        doc.addPage("landscape");
        currentY = margin;

        // Redraw header on new page
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "bold");

        let headerX = startX;
        headers.forEach((header, headerIndex) => {
          doc.rect(headerX, currentY, columnWidths[headerIndex], rowHeight);
          doc.text(header, headerX + (headerIndex === 0 ? 4 : 2), currentY + 7);
          headerX += columnWidths[headerIndex];
        });

        currentY += rowHeight;
        doc.setFont(undefined, "normal");
      }

      // Alternate row colors for better readability
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250); // Very light gray for even rows
        doc.rect(startX, currentY, tableWidth, rowHeight, "F");
      }

      // Add cell content with borders
      let cellX = startX;
      const rowNumber = index + 1; // Calculate row number (starting from 1)
      const rowData = [
        rowNumber.toString(), // Add row number as first column
        record.employeeName,
        record.pno,
        record.leaveType,
        formatDate(record.startDate),
        formatDate(record.endDate),
        record.days.toString(),
        record.status.charAt(0).toUpperCase() + record.status.slice(1), // Capitalize status
        formatDate(record.appliedDate),
      ];

      rowData.forEach((data, dataIndex) => {
        // Draw cell border
        doc.rect(cellX, currentY, columnWidths[dataIndex], rowHeight);

        // For longer text fields, use a smaller font or abbreviate
        let displayText = data;
        let textSize = 9;

        // Specific adjustments for each column
        if (dataIndex === 1 && data.length > 12) {
          // Employee name (now index 1)
          displayText =
            data.split(" ")[0] + " " + data.split(" ")[1].charAt(0) + ".";
        } else if ((dataIndex === 3 || dataIndex === 7) && data.length > 8) {
          // Leave Type and Status
          textSize = 8;
        }

        doc.setFontSize(textSize);

        // Center the number in the first column
        if (dataIndex === 0) {
          doc.text(displayText, cellX + columnWidths[0] / 2, currentY + 7, {
            align: "center",
          });
        } else {
          doc.text(displayText, cellX + 2, currentY + 7);
        }

        cellX += columnWidths[dataIndex];
      });

      // Reset font size for next row
      doc.setFontSize(9);
      currentY += rowHeight;
    });

    // Add summary section
    const summaryY = currentY + 15;
    if (summaryY < pageHeight - 40) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, summaryY - 5, pageWidth - margin, summaryY - 5);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text("Summary Statistics", margin, summaryY);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      const approvedCount = filteredRecords.filter(
        (r) => r.status === "approved"
      ).length;
      const pendingCount = filteredRecords.filter(
        (r) => r.status === "pending"
      ).length;
      const rejectedCount = filteredRecords.filter(
        (r) => r.status === "rejected"
      ).length;
      const totalDays = filteredRecords.reduce((sum, r) => sum + r.days, 0);

      doc.text(`Approved Leaves: ${approvedCount}`, margin, summaryY + 10);
      doc.text(`Pending Leaves: ${pendingCount}`, margin, summaryY + 20);
      doc.text(`Rejected Leaves: ${rejectedCount}`, margin, summaryY + 30);
      doc.text(`Total Leave Days: ${totalDays}`, margin, summaryY + 40);
    } else {
      // If there's no space, add a new page for the summary
      addFooter();
      doc.addPage("landscape");
      currentY = margin;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, "bold");
      doc.text("Summary Statistics", margin, currentY);

      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      const approvedCount = filteredRecords.filter(
        (r) => r.status === "approved"
      ).length;
      const pendingCount = filteredRecords.filter(
        (r) => r.status === "pending"
      ).length;
      const rejectedCount = filteredRecords.filter(
        (r) => r.status === "rejected"
      ).length;
      const totalDays = filteredRecords.reduce((sum, r) => sum + r.days, 0);

      doc.text(`Approved Leaves: ${approvedCount}`, margin, currentY + 10);
      doc.text(`Pending Leaves: ${pendingCount}`, margin, currentY + 20);
      doc.text(`Rejected Leaves: ${rejectedCount}`, margin, currentY + 30);
      doc.text(`Total Leave Days: ${totalDays}`, margin, currentY + 40);
    }

    // Add footer to the last page
    addFooter();

    // Generate filename with filters
    const filename = `leave-report-${selectedYear}-${
      selectedMonth === "all" ? "all-months" : months[parseInt(selectedMonth)]
    }-${new Date().toISOString().split("T")[0]}.pdf`;

    doc.save(filename);

    toast({
      title: "Report Generated",
      description: `PDF report with ${filteredRecords.length} records has been downloaded`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSelectedYear("all");
    setSelectedMonth("all");
  };

  // Calculate statistics for the dashboard cards
  const statistics = {
    totalEmployees: new Set(leaveRecords.map((record) => record.pno)).size,
    pendingApprovals: leaveRecords.filter(
      (record) => record.status === "pending"
    ).length,
    approvedThisMonth: leaveRecords.filter((record) => {
      const recordDate = new Date(record.appliedDate);
      const now = new Date();
      return (
        record.status === "approved" &&
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear()
      );
    }).length,
    onLeaveToday: leaveRecords.filter((record) => {
      const today = new Date();
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      return (
        record.status === "approved" && today >= startDate && today <= endDate
      );
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
            Leave Reports
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive leave reports and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {statistics.totalEmployees}
                </div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {statistics.pendingApprovals}
                </div>
                <p className="text-sm text-muted-foreground">
                  Pending Approvals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {statistics.approvedThisMonth}
                </div>
                <p className="text-sm text-muted-foreground">
                  Approved This Month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {statistics.onLeaveToday}
                </div>
                <p className="text-sm text-muted-foreground">On Leave Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                <SelectItem value="emergency">Emergency Leave</SelectItem>
                <SelectItem value="study">Study Leave</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredRecords.length} of {leaveRecords.length} records
            </div>
          </div>

          {/* Additional filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
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
              <Label htmlFor="month">Month</Label>
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
                onClick={clearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
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
          {loading ? (
            <div className="text-center py-8">
              <p>Loading leave records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No leave records found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {record.employeeName}
                      </TableCell>
                      <TableCell>{record.pno}</TableCell>
                      <TableCell className="capitalize">
                        {record.leaveType}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.startDate)} -{" "}
                        {formatDate(record.endDate)}
                      </TableCell>
                      <TableCell>{record.days}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{formatDate(record.appliedDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
