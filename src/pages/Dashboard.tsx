import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Simplified stats - only essential metrics
const stats = [
  {
    title: "Total Employees",
    value: "248",
    change: "+12%",
    icon: Users,
    description: "Active staff members",
  },
  {
    title: "Pending Requests",
    value: "23",
    change: "+8%",
    icon: Clock,
    description: "Awaiting approval",
  },
  {
    title: "Approved This Month",
    value: "156",
    change: "+15%",
    icon: Calendar,
    description: "Leave requests approved",
  },
];

// Simplified recent requests - only critical info
const recentRequests = [
  {
    employee: "John Doe",
    type: "Annual Leave",
    dates: "Dec 15-22",
    status: "pending",
    days: 6,
  },
  {
    employee: "Sarah Wilson",
    type: "Sick Leave",
    dates: "Dec 12-13",
    status: "approved",
    days: 2,
  },
  {
    employee: "Michael Chen",
    type: "Paternity Leave",
    dates: "Jan 5-Feb 2",
    status: "pending",
    days: 20,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header Section - Matches notification page styling */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your leave management summary.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/request")}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Stats Grid - Consistent with other pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Matches notification page layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests - Consistent with notification card styling */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Recent Leave Requests
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/requests")}
              >
                View All
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                    request.status === "pending"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {request.employee}
                        </p>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          •
                        </span>
                        <p className="text-xs text-muted-foreground truncate">
                          {request.type}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {request.dates} • {request.days} days
                      </p>
                    </div>
                    <Badge
                      variant={
                        request.status === "approved" ? "default" : "secondary"
                      }
                      className="text-xs whitespace-nowrap"
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Consistent with notification settings card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-11"
              onClick={() => navigate("/employees")}
            >
              <Users className="mr-3 h-4 w-4" />
              Employee Management
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-11"
              onClick={() => navigate("/history")}
            >
              <Calendar className="mr-3 h-4 w-4" />
              Leave History
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-11"
              onClick={() => navigate("/reports")}
            >
              <TrendingUp className="mr-3 h-4 w-4" />
              Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Future Features Card - Consistent styling */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground text-lg mb-2">
            More Features Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            Analytics dashboard and advanced reporting will be available in the
            next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
