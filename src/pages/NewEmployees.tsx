import { useState, useEffect } from "react";
import { Search, User, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  _id: string;
  employeeName: string;
  pno: string;
  designation: string;
  dutyStation: string;
  phone: string;
  totalUsedLeaveDays: number;
  leaveBalance: number;
  pendingLeaves: number;
  approvedLeaves: number;
  currentStatus: "active" | "on-leave" | "inactive";
  lastLeave?: {
    startDate: string;
    endDate: string;
    type: string;
    status: string;
    days: number;
  };
}

// Date formatting utility
const formatDate = (dateString: string) => {
  if (!dateString) return "No date";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Use relative URL for production, absolute for development
  const API_BASE_URL = "http://10.6.7.84:9000/api";

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/leaves/employees/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies if using session-based auth
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login again");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);

      let errorMessage = "Failed to fetch employees";

      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("ERR_CONNECTION_REFUSED")
      ) {
        errorMessage =
          "Cannot connect to server. Please make sure the backend is running.";
      } else if (error.message.includes("Unauthorized")) {
        errorMessage = "Please login again to access employee data.";
      }

      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add retry functionality
  const retryConnection = () => {
    setLoading(true);
    fetchEmployees();
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.pno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.dutyStation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Employee["currentStatus"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "on-leave":
        return <Badge variant="secondary">On Leave</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Employee Directory
          </h1>
          <p className="text-muted-foreground">
            View all employees created through leave requests
          </p>
        </div>
        <button
          onClick={retryConnection}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees by name, P/No, designation, or duty station..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card
            key={employee._id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {employee.employeeName}
                </CardTitle>
                {getStatusBadge(employee.currentStatus)}
              </div>
              <div className="text-sm text-muted-foreground">
                {employee.pno} • {employee.designation}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{employee.phone}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Duty Station:</span>{" "}
                {employee.dutyStation}
              </div>

              {/* Leave Balance */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Leave Balance</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-primary">
                  {employee.leaveBalance} days
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {employee.totalUsedLeaveDays} days used •{" "}
                  {employee.pendingLeaves} pending
                </div>
              </div>

              {employee.lastLeave && (
                <div className="text-sm border-t pt-3">
                  <div className="font-medium mb-1">Last Leave:</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="capitalize">
                        {employee.lastLeave.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Period:</span>
                      <span>
                        {formatDate(employee.lastLeave.startDate)} -{" "}
                        {formatDate(employee.lastLeave.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{employee.lastLeave.days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">
                        {employee.lastLeave.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!employee.lastLeave && (
                <div className="text-sm border-t pt-3 text-muted-foreground">
                  No leave history available
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No employees found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Employees will appear here after their first leave request is submitted"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
