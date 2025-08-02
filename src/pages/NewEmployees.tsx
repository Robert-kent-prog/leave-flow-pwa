import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  pno: string;
  designation: string;
  dutyStation: string;
  phone: string;
  status: "Active" | "On Leave" | "Inactive";
  leaveBalance: number;
  currentLeaveStart?: Date;
  currentLeaveEnd?: Date;
}
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    pno: "EMP001",
    designation: "Software Engineer",
    dutyStation: "IT Department",
    phone: "+254 700 123 456",
    status: "Active",
    leaveBalance: 25,
    currentLeaveStart: new Date("2025-10-01"),
    currentLeaveEnd: new Date("2025-11-05"),
  },
  {
    id: "2",
    name: "Sarah Wilson",
    pno: "EMP002",
    designation: "HR Manager",
    dutyStation: "HR Department",
    phone: "+254 700 234 567",
    status: "Inactive",
    leaveBalance: 0,
    currentLeaveStart: new Date("2025-10-01"),
    currentLeaveEnd: new Date("2025-11-05"),
  },
  {
    id: "3",
    name: "Michael Chen",
    pno: "EMP003",
    designation: "Finance Officer",
    dutyStation: "Finance Department",
    phone: "+254 700 345 678",
    status: "Active",
    leaveBalance: 30,
    currentLeaveStart: new Date("2025-10-01"),
    currentLeaveEnd: new Date("2025-11-05"),
  },
  {
    id: "3",
    name: "Spoiler Kent",
    pno: "EMP004",
    designation: "Chief Accountant",
    dutyStation: "Finance Department",
    phone: "+254 700 355 678",
    status: "On Leave",
    leaveBalance: 26,
    currentLeaveStart: new Date("2025-10-01"),
    currentLeaveEnd: new Date("2025-11-05"),
  },
];

const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  let days = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const day = current.getDay();
    // Skip weekends (Sunday = 0, Saturday = 6)
    if (day !== 0 && day !== 6) {
      days++;
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
};

export default function NewEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    pno: "",
    designation: "",
    dutyStation: "",
    phone: "",
    status: "Active" as Employee["status"],
    leaveBalance: 30,
  });

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.pno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmployee) {
      setEmployees(
        employees.map((emp) =>
          emp.id === editingEmployee.id
            ? { ...formData, id: editingEmployee.id }
            : emp
        )
      );
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully.",
      });
    } else {
      const newEmployee: Employee = {
        ...formData,
        id: Date.now().toString(),
      };
      setEmployees([...employees, newEmployee]);
      toast({
        title: "Employee Added",
        description: "New employee has been added successfully.",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      pno: "",
      designation: "",
      dutyStation: "",
      phone: "",
      status: "Active",
      leaveBalance: 30,
    });
    setEditingEmployee(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      pno: employee.pno,
      designation: employee.designation,
      dutyStation: employee.dutyStation,
      phone: employee.phone,
      status: employee.status,
      leaveBalance: employee.leaveBalance,
    });
    setIsDialogOpen(true);
  };

  const updateLeaveBalances = () => {
    const today = new Date();
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) => {
        if (employee.status !== "On Leave" || !employee.currentLeaveStart) {
          return employee;
        }

        const endDate = employee.currentLeaveEnd || today;
        const daysTaken = calculateWorkingDays(
          new Date(employee.currentLeaveStart),
          endDate > today ? today : endDate
        );

        // Only update if the employee is still on leave
        if (today <= endDate) {
          return {
            ...employee,
            leaveBalance: Math.max(0, (employee.leaveBalance || 0) - daysTaken),
          };
        } else {
          // Return to active status when leave period ends
          return {
            ...employee,
            status: "Active",
            currentLeaveStart: undefined,
            currentLeaveEnd: undefined,
          };
        }
      })
    );
  };
  useEffect(() => {
    // Update immediately on mount
    updateLeaveBalances();

    // Then update daily (at midnight)
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      updateLeaveBalances();
      // Set interval to update every 24 hours after first midnight trigger
      const dailyUpdate = setInterval(updateLeaveBalances, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyUpdate);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  const EmployeeLeaveStatus = ({ employee }: { employee: Employee }) => {
    // Handle inactive employees first
    if (employee.status === "Inactive") {
      return <span>Your Leave Ended</span>;
    }

    // Then handle active employees
    if (employee.status !== "On Leave") {
      return <span>{employee.leaveBalance} days remaining</span>;
    }

    // Only do leave calculations for employees "On Leave"
    const today = new Date();
    const endDate = employee.currentLeaveEnd || today;
    const daysTaken = calculateWorkingDays(
      new Date(employee.currentLeaveStart!),
      endDate > today ? today : endDate
    );
    const totalDays = employee.currentLeaveEnd
      ? calculateWorkingDays(
          new Date(employee.currentLeaveStart!),
          new Date(employee.currentLeaveEnd)
        )
      : "ongoing";

    return (
      <div className="text-sm">
        <div>
          On leave: {daysTaken}/{totalDays} days
        </div>
        <div>{employee.leaveBalance - daysTaken} days remaining</div>
      </div>
    );
  };
  const handleDelete = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    toast({
      title: "Employee Deleted",
      description: "Employee has been removed from the system.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "On Leave":
        return <Badge variant="secondary">On Leave</Badge>;
      case "Inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            Manage employee information and leave balances
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger> */}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pno">P/No</Label>
                <Input
                  id="pno"
                  value={formData.pno}
                  onChange={(e) =>
                    setFormData({ ...formData, pno: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dutyStation">Duty Station</Label>
                <Input
                  id="dutyStation"
                  value={formData.dutyStation}
                  onChange={(e) =>
                    setFormData({ ...formData, dutyStation: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Employee["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveBalance">Leave Balance (Days)</Label>
                <Input
                  id="leaveBalance"
                  type="number"
                  value={formData.leaveBalance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      leaveBalance: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Update" : "Add"} Employee
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employees ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">P/No</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Designation
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Duty Station
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Leave Balance
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{employee.name}</td>
                    <td className="py-3 px-4">{employee.pno}</td>
                    <td className="py-3 px-4">{employee.designation}</td>
                    <td className="py-3 px-4">{employee.dutyStation}</td>
                    <td className="py-3 px-4">{employee.phone}</td>
                    <td className="py-3 px-4">
                      <EmployeeLeaveStatus employee={employee} />
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
