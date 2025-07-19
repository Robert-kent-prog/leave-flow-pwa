import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Employees",
    value: "248",
    change: "+12%",
    icon: Users,
    color: "text-primary"
  },
  {
    title: "Pending Requests",
    value: "23",
    change: "+8%",
    icon: Clock,
    color: "text-warning"
  },
  {
    title: "Approved This Month",
    value: "156",
    change: "+15%",
    icon: Calendar,
    color: "text-success"
  },
  {
    title: "Leave Utilization",
    value: "78%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-primary"
  }
];

const recentRequests = [
  {
    employee: "John Doe",
    type: "Annual Leave",
    dates: "Dec 15 - Dec 22",
    status: "Pending",
    days: 6
  },
  {
    employee: "Sarah Wilson",
    type: "Sick Leave",
    dates: "Dec 12 - Dec 13",
    status: "Approved",
    days: 2
  },
  {
    employee: "Michael Chen",
    type: "Paternity Leave",
    dates: "Jan 5 - Feb 2",
    status: "Pending",
    days: 20
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your leave management overview.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-hover">
          New Leave Request
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-card bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <Card className="lg:col-span-2 border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{request.employee}</p>
                    <p className="text-sm text-muted-foreground">{request.type}</p>
                    <p className="text-sm text-muted-foreground">{request.dates} ({request.days} days)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      request.status === "Approved" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Employees
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Leave
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}