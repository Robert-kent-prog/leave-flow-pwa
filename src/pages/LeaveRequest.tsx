import { useState } from "react";
import { Calendar, FileText, Send, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function LeaveRequest() {
  const [formData, setFormData] = useState({
    employeeName: "",
    pno: "",
    designation: "",
    dutyStation: "",
    phone: "",
    leaveType: "",
    applicationDate: new Date(),
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    reason: "",
  });

  const { toast } = useToast();

  const calculateLeaveDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    let days = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        days++;
      }
    }

    return days;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Invalid Dates",
        description: "Please select both start and end dates.",
        variant: "destructive",
      });
      return;
    }

    if (formData.startDate > formData.endDate) {
      toast({
        title: "Invalid Date Range",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Leave Request Submitted",
      description: `Your leave request for ${calculateLeaveDays()} working days has been submitted for approval.`,
    });

    // Reset form
    setFormData({
      employeeName: "",
      pno: "",
      designation: "",
      dutyStation: "",
      phone: "",
      leaveType: "",
      applicationDate: new Date(),
      startDate: undefined,
      endDate: undefined,
      reason: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            Leave Request
          </h1>
          <p className="text-muted-foreground">
            Submit a new leave application
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Leave Application Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employee Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employee Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Full Name</Label>
                    <Input
                      id="employeeName"
                      value={formData.employeeName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employeeName: e.target.value,
                        })
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
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
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
                        setFormData({
                          ...formData,
                          dutyStation: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Leave Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select
                      value={formData.leaveType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, leaveType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="maternity">
                          Maternity Leave
                        </SelectItem>
                        <SelectItem value="paternity">
                          Paternity Leave
                        </SelectItem>
                        <SelectItem value="emergency">
                          Emergency Leave
                        </SelectItem>
                        <SelectItem value="study">Study Leave</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Application Date</Label>
                    <Input
                      value={format(formData.applicationDate, "PPP")}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.startDate
                            ? format(formData.startDate, "PPP")
                            : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) =>
                            setFormData({ ...formData, startDate: date })
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {formData.endDate
                            ? format(formData.endDate, "PPP")
                            : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) =>
                            setFormData({ ...formData, endDate: date })
                          }
                          disabled={(date) =>
                            date < (formData.startDate || new Date())
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a brief reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Submit Leave Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Employee:</span>
                <span className="text-sm font-medium">
                  {formData.employeeName || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Leave Type:
                </span>
                <span className="text-sm font-medium">
                  {formData.leaveType || "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Start Date:
                </span>
                <span className="text-sm font-medium">
                  {formData.startDate
                    ? format(formData.startDate, "MMM dd, yyyy")
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">End Date:</span>
                <span className="text-sm font-medium">
                  {formData.endDate
                    ? format(formData.endDate, "MMM dd, yyyy")
                    : "Not selected"}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Working Days:</span>
                  <span className="text-lg font-bold text-primary">
                    {calculateLeaveDays()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  * Excludes weekends
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Important Notes:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                  • Leave requests must be submitted at least 48 hours in
                  advance
                </li>
                <li>• Emergency leave requires supervisor approval</li>
                <li>
                  • Medical certificates required for sick leave over 3 days
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
