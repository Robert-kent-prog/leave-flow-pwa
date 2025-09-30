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
  totalLeaveDays: number;
  pendingLeaves: number;
  approvedLeaves: number;
  currentStatus: "active" | "on-leave" | "inactive";
  lastLeave?: {
    startDate: string;
    endDate: string;
    type: string;
    status: string;
  };
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      // This API should aggregate employees from leave requests
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.pno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
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

  const calculateLeaveBalance = (employee: Employee) => {
    // Assuming 21 days annual leave per year
    const annualEntitlement = 21;
    const usedDays = employee.approvedLeaves;
    return Math.max(0, annualEntitlement - usedDays);
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Employee Directory
        </h1>
        <p className="text-muted-foreground">
          View all employees created through leave requests
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees by name, P/No, or designation..."
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
                  {calculateLeaveBalance(employee)} days
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {employee.approvedLeaves} days used • {employee.pendingLeaves}{" "}
                  pending
                </div>
              </div>

              {employee.lastLeave && (
                <div className="text-sm border-t pt-2">
                  <span className="font-medium">Last Leave:</span>{" "}
                  {employee.lastLeave.type}
                  <div className="text-xs text-muted-foreground">
                    {new Date(
                      employee.lastLeave.startDate
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(employee.lastLeave.endDate).toLocaleDateString()}
                  </div>
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
              Employees will appear here after their first leave request is
              submitted
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
