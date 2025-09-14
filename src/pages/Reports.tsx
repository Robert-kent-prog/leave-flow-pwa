/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Download, Filter, BarChart3, PieChart, Users } from "lucide-react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import jsPDF from "jspdf";

// Import autoTable using the side-effect import
import "jspdf-autotable";

// Extend the jsPDF type definition
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Sample data for charts
const monthlyData = [
  { month: "Jan", annual: 45, sick: 12, maternity: 8, paternity: 3 },
  { month: "Feb", annual: 52, sick: 18, maternity: 6, paternity: 2 },
  { month: "Mar", annual: 48, sick: 15, maternity: 10, paternity: 4 },
  { month: "Apr", annual: 61, sick: 9, maternity: 7, paternity: 1 },
  { month: "May", annual: 55, sick: 14, maternity: 5, paternity: 3 },
  { month: "Jun", annual: 67, sick: 11, maternity: 9, paternity: 2 },
];

const leaveTypeData = [
  { name: "Annual Leave", value: 328, color: "#3b82f6" },
  { name: "Sick Leave", value: 79, color: "#ef4444" },
  { name: "Maternity Leave", value: 45, color: "#10b981" },
  { name: "Paternity Leave", value: 15, color: "#f59e0b" },
];

const departmentData = [
  { department: "IT", employees: 45, onLeave: 8, utilization: "18%" },
  { department: "HR", employees: 12, onLeave: 3, utilization: "25%" },
  { department: "Finance", employees: 28, onLeave: 5, utilization: "18%" },
  { department: "Marketing", employees: 22, onLeave: 7, utilization: "32%" },
  { department: "Operations", employees: 38, onLeave: 6, utilization: "16%" },
];

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const generatePDFReport = () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("Leave Management Report", 20, 30);

    // Add filters info
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(
      `Year: ${selectedYear} | Month: ${
        selectedMonth === "all" ? "All Months" : selectedMonth
      } | Department: ${
        selectedDepartment === "all" ? "All Departments" : selectedDepartment
      }`,
      20,
      45
    );
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);

    // Table configuration
    const startX = 20;
    const startY = 70;
    const rowHeight = 10;
    const columnWidths = [50, 40, 40, 40]; // Widths for each column
    const tableWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    // Draw table header
    doc.setFillColor(59, 130, 246); // Blue background for header
    doc.rect(startX, startY, tableWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255); // White text for header
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");

    let currentX = startX;
    doc.text("Department", currentX + 5, startY + 7);
    currentX += columnWidths[0];
    doc.text("Employees", currentX + 5, startY + 7);
    currentX += columnWidths[1];
    doc.text("On Leave", currentX + 5, startY + 7);
    currentX += columnWidths[2];
    doc.text("Utilization", currentX + 5, startY + 7);

    // Draw table rows
    doc.setTextColor(0, 0, 0); // Black text for rows
    doc.setFont(undefined, "normal");

    let currentY = startY + rowHeight;

    departmentData.forEach((dept, index) => {
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
      doc.text(dept.department, cellX + 5, currentY + 7);
      cellX += columnWidths[0];
      doc.text(dept.employees.toString(), cellX + 5, currentY + 7);
      cellX += columnWidths[1];
      doc.text(dept.onLeave.toString(), cellX + 5, currentY + 7);
      cellX += columnWidths[2];
      doc.text(dept.utilization, cellX + 5, currentY + 7);

      currentY += rowHeight;
    });

    // Add leave type summary section
    currentY += 15;
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Leave Type Summary", startX, currentY);

    currentY += 10;
    const leaveTypeTableWidth = 60;
    const leaveTypeColumnWidths = [60, 40, 40];
    const leaveTypeTotalWidth = leaveTypeColumnWidths.reduce(
      (sum, width) => sum + width,
      0
    );

    // Leave type table header
    doc.setFillColor(59, 130, 246);
    doc.rect(startX, currentY, leaveTypeTotalWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");

    let leaveTypeX = startX;
    doc.text("Leave Type", leaveTypeX + 5, currentY + 7);
    leaveTypeX += leaveTypeColumnWidths[0];
    doc.text("Total Days", leaveTypeX + 5, currentY + 7);
    leaveTypeX += leaveTypeColumnWidths[1];
    doc.text("Percentage", leaveTypeX + 5, currentY + 7);

    // Leave type table rows
    currentY += rowHeight;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    leaveTypeData.forEach((leave, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, currentY, leaveTypeTotalWidth, rowHeight, "F");
      }

      // Draw borders
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);

      let cellX = startX;
      for (let i = 0; i <= leaveTypeColumnWidths.length; i++) {
        doc.line(cellX, currentY, cellX, currentY + rowHeight);
        if (i < leaveTypeColumnWidths.length) {
          cellX += leaveTypeColumnWidths[i];
        }
      }
      doc.line(
        startX,
        currentY + rowHeight,
        startX + leaveTypeTotalWidth,
        currentY + rowHeight
      );

      // Add content
      cellX = startX;
      doc.text(leave.name, cellX + 5, currentY + 7);
      cellX += leaveTypeColumnWidths[0];
      doc.text(leave.value.toString(), cellX + 5, currentY + 7);
      cellX += leaveTypeColumnWidths[1];
      doc.text(
        `${(
          (leave.value / leaveTypeData.reduce((sum, l) => sum + l.value, 0)) *
          100
        ).toFixed(1)}%`,
        cellX + 5,
        currentY + 7
      );

      currentY += rowHeight;
    });

    doc.save(`leave-report-${selectedYear}-${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Generate and view comprehensive leave management reports
          </p>
        </div>
        <Button onClick={generatePDFReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Filters - MOBILE STACKED + DESKTOP GRID */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* MOBILE: Vertical stacked layout */}
          <div className="md:hidden space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="february">February</SelectItem>
                  <SelectItem value="march">March</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                  <SelectItem value="may">May</SelectItem>
                  <SelectItem value="june">June</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="august">August</SelectItem>
                  <SelectItem value="september">September</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                  <SelectItem value="november">November</SelectItem>
                  <SelectItem value="december">December</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DESKTOP: Grid layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="february">February</SelectItem>
                  <SelectItem value="march">March</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                  <SelectItem value="may">May</SelectItem>
                  <SelectItem value="june">June</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="august">August</SelectItem>
                  <SelectItem value="september">September</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                  <SelectItem value="november">November</SelectItem>
                  <SelectItem value="december">December</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row - MOBILE STACKED + DESKTOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Leave Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Leave Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[4/3]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="annual" fill="#3b82f6" name="Annual" />
                  <Bar dataKey="sick" fill="#ef4444" name="Sick" />
                  <Bar dataKey="maternity" fill="#10b981" name="Maternity" />
                  <Bar dataKey="paternity" fill="#f59e0b" name="Paternity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leave Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Leave Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[1/1] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {leaveTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis - MOBILE CARD LAYOUT + DESKTOP TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* MOBILE CARD LAYOUT (only visible on mobile) */}
          <div className="md:hidden space-y-4">
            {departmentData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No department data available.
                </p>
              </div>
            ) : (
              departmentData.map((dept, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg shadow bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{dept.department}</h3>
                      <p className="text-sm text-muted-foreground">
                        {dept.employees} total employees • {dept.onLeave} on
                        leave
                      </p>
                    </div>
                    <Badge
                      variant={
                        parseInt(dept.utilization) > 25
                          ? "destructive"
                          : parseInt(dept.utilization) > 20
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {parseInt(dept.utilization) > 25
                        ? "High"
                        : parseInt(dept.utilization) > 20
                        ? "Medium"
                        : "Low"}
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Utilization Rate
                      </p>
                      <p className="text-sm font-medium">{dept.utilization}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        On Leave
                      </p>
                      <p className="text-sm font-medium">{dept.onLeave}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE (only visible on desktop) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Total Employees
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Currently on Leave
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Utilization Rate
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No department data available.
                    </td>
                  </tr>
                ) : (
                  departmentData.map((dept, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-muted/50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4 font-medium">
                        {dept.department}
                      </td>
                      <td className="py-3 px-4">{dept.employees}</td>
                      <td className="py-3 px-4">{dept.onLeave}</td>
                      <td className="py-3 px-4">{dept.utilization}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            parseInt(dept.utilization) > 25
                              ? "destructive"
                              : parseInt(dept.utilization) > 20
                              ? "default"
                              : "secondary"
                          }
                        >
                          {parseInt(dept.utilization) > 25
                            ? "High"
                            : parseInt(dept.utilization) > 20
                            ? "Medium"
                            : "Low"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
