import { useState } from "react";
import { Plus, Edit, Trash2, Search, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  pNumber: string;
  designation: string;
  dutyStation: string;
  phone: string;
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    pNumber: "P001",
    designation: "Software Engineer",
    dutyStation: "Head Office",
    phone: "+254-700-123456"
  },
  {
    id: "2",
    name: "Sarah Wilson",
    pNumber: "P002", 
    designation: "HR Manager",
    dutyStation: "Head Office",
    phone: "+254-700-789012"
  },
  {
    id: "3",
    name: "Michael Chen",
    pNumber: "P003",
    designation: "Accountant",
    dutyStation: "Branch Office",
    phone: "+254-700-345678"
  }
];

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    pNumber: "",
    designation: "",
    dutyStation: "",
    phone: ""
  });

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.pNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData }
          : emp
      ));
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully.",
      });
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData
      };
      setEmployees(prev => [...prev, newEmployee]);
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
      pNumber: "",
      designation: "",
      dutyStation: "",
      phone: ""
    });
    setEditingEmployee(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      pNumber: employee.pNumber,
      designation: employee.designation,
      dutyStation: employee.dutyStation,
      phone: employee.phone
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    toast({
      title: "Employee Deleted",
      description: "Employee has been removed from the system.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Management</h1>
          <p className="text-muted-foreground">Manage your organization's employees</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pNumber">P/Number</Label>
                <Input
                  id="pNumber"
                  value={formData.pNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, pNumber: e.target.value }))}
                  placeholder="Enter P/Number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  placeholder="Enter job designation"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dutyStation">Duty Station</Label>
                <Input
                  id="dutyStation"
                  value={formData.dutyStation}
                  onChange={(e) => setFormData(prev => ({ ...prev, dutyStation: e.target.value }))}
                  placeholder="Enter duty station"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingEmployee ? "Update" : "Add"} Employee
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search employees by name, P/Number, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{employees.length}</div>
            <p className="text-sm text-muted-foreground">Total Employees</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {employees.filter(emp => emp.dutyStation === "Head Office").length}
            </div>
            <p className="text-sm text-muted-foreground">Head Office</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {employees.filter(emp => emp.dutyStation === "Branch Office").length}
            </div>
            <p className="text-sm text-muted-foreground">Branch Office</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="border bg-gradient-card hover:shadow-elevation transition-all duration-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.pNumber}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-foreground font-medium">{employee.designation}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {employee.dutyStation}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-1" />
                        {employee.phone}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(employee)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(employee.id)}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No employees found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}