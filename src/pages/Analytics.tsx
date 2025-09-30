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

// Sample data for charts
const monthlyData = [
  { month: "Jan", annual: 45, sick: 12, maternity: 8, paternity: 3 },
  { month: "Feb", annual: 52, sick: 18, maternity: 6, paternity: 2 },
  { month: "Mar", annual: 48, sick: 15, maternity: 10, paternity: 4 },
  { month: "Apr", annual: 61, sick: 9, maternity: 7, paternity: 1 },
  { month: "May", annual: 55, sick: 14, maternity: 5, paternity: 3 },
  { month: "Jun", annual: 67, sick: 11, maternity: 9, paternity: 2 },
  { month: "Jul", annual: 58, sick: 16, maternity: 4, paternity: 2 },
  { month: "Aug", annual: 72, sick: 13, maternity: 8, paternity: 3 },
];

const leaveTypeData = [
  { name: "Annual Leave", value: 458, color: "#3b82f6" },
  { name: "Sick Leave", value: 108, color: "#ef4444" },
  { name: "Maternity Leave", value: 67, color: "#10b981" },
  { name: "Paternity Leave", value: 24, color: "#f59e0b" },
  { name: "Emergency Leave", value: 42, color: "#8b5cf6" },
];

const departmentData = [
  {
    department: "IT",
    employees: 45,
    onLeave: 8,
    utilization: "18%",
    pending: 3,
  },
  {
    department: "HR",
    employees: 12,
    onLeave: 3,
    utilization: "25%",
    pending: 2,
  },
  {
    department: "Finance",
    employees: 28,
    onLeave: 5,
    utilization: "18%",
    pending: 1,
  },
  {
    department: "Marketing",
    employees: 22,
    onLeave: 7,
    utilization: "32%",
    pending: 4,
  },
  {
    department: "Operations",
    employees: 38,
    onLeave: 6,
    utilization: "16%",
    pending: 2,
  },
  {
    department: "Sales",
    employees: 35,
    onLeave: 9,
    utilization: "26%",
    pending: 5,
  },
  {
    department: "Support",
    employees: 18,
    onLeave: 4,
    utilization: "22%",
    pending: 2,
  },
];

const statusBreakdown = [
  { status: "Approved", count: 458, color: "#10b981" },
  { status: "Pending", count: 89, color: "#f59e0b" },
  { status: "Rejected", count: 23, color: "#ef4444" },
  { status: "Cancelled", count: 12, color: "#6b7280" },
];

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground">
            Comprehensive leave management insights and analytics
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid - Optimized sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Leave Trends - Compact chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Monthly Leave Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              {" "}
              {/* Reduced height */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="annual"
                    fill="#3b82f6"
                    name="Annual"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="sick"
                    fill="#ef4444"
                    name="Sick"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="maternity"
                    fill="#10b981"
                    name="Maternity"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leave Type Distribution - Compact pie chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5" />
              Leave Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64 flex flex-col">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={leaveTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                      }
                    >
                      {leaveTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} days`, "Total"]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t">
                {leaveTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-xs font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Request Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusBreakdown}
                  layout="vertical"
                  margin={{ left: 30, right: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="status"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Utilization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Department Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-24 truncate">
                    {dept.department}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: dept.utilization }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {dept.utilization}
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Department Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {departmentData.map((dept, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{dept.department}</span>
                  <Badge variant="secondary" className="text-xs">
                    {dept.utilization}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Employees:</span>
                    <span className="font-medium ml-1">{dept.employees}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">On Leave:</span>
                    <span className="font-medium ml-1">{dept.onLeave}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-medium ml-1">{dept.pending}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Employees</th>
                  <th className="text-left py-3 px-4 font-medium">On Leave</th>
                  <th className="text-left py-3 px-4 font-medium">Pending</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Utilization
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{dept.department}</td>
                    <td className="py-3 px-4">{dept.employees}</td>
                    <td className="py-3 px-4">{dept.onLeave}</td>
                    <td className="py-3 px-4">{dept.pending}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{dept.utilization}</Badge>
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
