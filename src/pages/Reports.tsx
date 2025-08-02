/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { useState } from "react";
import {
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Users,
} from "lucide-react";
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
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

    // Add department data table
    const tableData = departmentData.map((dept) => [
      dept.department,
      dept.employees.toString(),
      dept.onLeave.toString(),
      dept.utilization,
    ]);

    (doc as any).autoTable({
      head: [["Department", "Total Employees", "On Leave", "Utilization"]],
      body: tableData,
      startY: 70,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Add leave type summary
    let finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Leave Type Summary", 20, finalY);

    const leaveTypeTable = leaveTypeData.map((leave) => [
      leave.name,
      leave.value.toString(),
      `${(
        (leave.value / leaveTypeData.reduce((sum, l) => sum + l.value, 0)) *
        100
      ).toFixed(1)}%`,
    ]);

    (doc as any).autoTable({
      head: [["Leave Type", "Total Days", "Percentage"]],
      body: leaveTypeTable,
      startY: finalY + 10,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
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
                  <SelectItem value="2022">2022</SelectItem>
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
                  <SelectValue />
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

      {/* Charts Row */}
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="annual" fill="#3b82f6" name="Annual" />
                <Bar dataKey="sick" fill="#ef4444" name="Sick" />
                <Bar dataKey="maternity" fill="#10b981" name="Maternity" />
                <Bar dataKey="paternity" fill="#f59e0b" name="Paternity" />
              </BarChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <RechartsPieChart
                  data={leaveTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                >
                  {leaveTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {leaveTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {departmentData.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
