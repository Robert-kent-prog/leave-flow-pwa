import { useContext, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  FileText,
  Loader2,
  Send,
  UserRound,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { AuthContext, ApiContext } from "@/contexts/AuthContextInstance";
import { useEmployeesDirectory } from "@/hooks/useEmployeesDirectory";
import { useLeaveBalance } from "@/hooks/useLeaveBalance";
import { useCompanyHolidays } from "@/hooks/useCompanyHolidays";
import { isHrRole } from "@/lib/roles";
import type { ApiHoliday } from "@/types/api";

type LeaveRequestFormState = {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
};

type RequestProfile = {
  id: string;
  name: string;
  staffId: string;
  department?: string;
  designation?: string;
  dutyStation?: string;
  phone?: string;
};

const leaveTypeOptions = [
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "compassionate", label: "Compassionate Leave" },
  { value: "emergency", label: "Emergency Leave" },
  { value: "study", label: "Study Leave" },
  { value: "other", label: "Other" },
];

const toDateKey = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setHours(0, 0, 0, 0);
  return date.toISOString().split("T")[0];
};

const calculateWorkingDays = (
  startDate?: string,
  endDate?: string,
  holidayDateSet: Set<string> = new Set(),
) => {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let days = 0;
  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    if (
      date.getDay() !== 0 &&
      date.getDay() !== 6 &&
      !holidayDateSet.has(toDateKey(date))
    ) {
      days += 1;
    }
  }

  return days;
};

export default function LeaveRequest() {
  const authContext = useContext(AuthContext);
  const apiContext = useContext(ApiContext);
  const queryClient = useQueryClient();

  if (!authContext || !apiContext) {
    throw new Error("LeaveRequest must be used within the auth and API providers");
  }

  const { user } = authContext;
  const { createLeaveRequest, isLoading } = apiContext;
  const canCreateOnBehalf = isHrRole(user?.role);
  const employeesQuery = useEmployeesDirectory(canCreateOnBehalf);
  const holidaysQuery = useCompanyHolidays();

  const [formData, setFormData] = useState<LeaveRequestFormState>({
    employeeId: "self",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const selectedProfile = useMemo<RequestProfile | null>(() => {
    if (!user) {
      return null;
    }

    if (!canCreateOnBehalf || formData.employeeId === "self") {
      return {
        id: user._id,
        name: user.username,
        staffId: user.staffId,
        department: user.department,
        designation: user.designation,
        dutyStation: user.dutyStation,
        phone: user.phone,
      };
    }

    const employee = (employeesQuery.data ?? []).find(
      (candidate) => candidate._id === formData.employeeId,
    );

    if (!employee) {
      return null;
    }

    return {
      id: employee._id,
      name: employee.employeeName,
      staffId: employee.pno,
      department: employee.department,
      designation: employee.designation,
      dutyStation: employee.dutyStation,
      phone: employee.phone,
    };
  }, [canCreateOnBehalf, employeesQuery.data, formData.employeeId, user]);

  const holidayDateSet = useMemo(
    () => new Set((holidaysQuery.data ?? []).map((holiday) => toDateKey(holiday.date))),
    [holidaysQuery.data],
  );
  const holidaysInSelectedRange = useMemo<ApiHoliday[]>(() => {
    if (!formData.startDate || !formData.endDate) {
      return [];
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return [];
    }

    return (holidaysQuery.data ?? []).filter((holiday) => {
      const holidayDate = new Date(holiday.date);
      holidayDate.setHours(0, 0, 0, 0);
      return holidayDate >= start && holidayDate <= end;
    });
  }, [formData.endDate, formData.startDate, holidaysQuery.data]);

  const missingProfileFields = useMemo(() => {
    if (!selectedProfile) {
      return ["employee profile"];
    }

    const missing: string[] = [];

    if (!selectedProfile.designation) missing.push("designation");
    if (!selectedProfile.dutyStation) missing.push("duty station");
    if (!selectedProfile.phone) missing.push("phone number");

    return missing;
  }, [selectedProfile]);

  const workingDays = useMemo(
    () => calculateWorkingDays(formData.startDate, formData.endDate, holidayDateSet),
    [formData.endDate, formData.startDate, holidayDateSet],
  );
  const leaveBalanceQuery = useLeaveBalance(
    canCreateOnBehalf ? selectedProfile?.staffId : undefined,
    Boolean(selectedProfile),
  );
  const selectedBalance = useMemo(
    () =>
      leaveBalanceQuery.data?.balances.find(
        (balance) => balance.leaveType === formData.leaveType,
      ),
    [formData.leaveType, leaveBalanceQuery.data?.balances],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast.error("You must be signed in to submit a leave request.");
      return;
    }

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast.error("Complete the leave type, date range, and reason.");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    if (missingProfileFields.length > 0) {
      toast.error(
        `The selected profile is missing: ${missingProfileFields.join(", ")}.`,
      );
      return;
    }

    try {
      await createLeaveRequest({
        employeeId: canCreateOnBehalf && formData.employeeId !== "self"
          ? formData.employeeId
          : undefined,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });

      await queryClient.invalidateQueries({ queryKey: ["leave-records"] });
      await queryClient.invalidateQueries({ queryKey: ["leave-balance"] });

      toast.success(
        `${selectedProfile?.name || "Leave request"} submitted successfully.`,
      );

      setFormData((current) => ({
        ...current,
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
      }));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit the leave request.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {canCreateOnBehalf ? "Create Leave Request" : "Submit Leave Request"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {canCreateOnBehalf
            ? "Submit a leave request for yourself or select an employee account to raise it on their behalf."
            : "Your profile details are used automatically when you submit a leave request."}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {canCreateOnBehalf && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="employeeId">Request For</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          employeeId: value,
                        }))
                      }
                    >
                      <SelectTrigger id="employeeId">
                        <SelectValue placeholder="Select request owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">My account</SelectItem>
                        {(employeesQuery.data ?? []).map((employee) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.employeeName} • {employee.pno}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={formData.leaveType}
                    onValueChange={(value) =>
                      setFormData((current) => ({
                        ...current,
                        leaveType: value,
                      }))
                    }
                  >
                    <SelectTrigger id="leaveType">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        reason: event.target.value,
                      }))
                    }
                    placeholder="Explain the leave request clearly so HR can review it."
                    className="min-h-32"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {workingDays > 0
                      ? `${workingDays} working day${workingDays === 1 ? "" : "s"} selected`
                      : "Choose a valid date range. Weekends and company holidays are excluded."}
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || missingProfileFields.length > 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Request Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProfile ? (
                <>
                  <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="mt-1 text-lg font-semibold">
                      {selectedProfile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProfile.staffId}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Department
                      </p>
                      <p className="mt-1 font-medium">
                        {selectedProfile.department || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Designation
                      </p>
                      <p className="mt-1 font-medium">
                        {selectedProfile.designation || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Duty Station
                      </p>
                      <p className="mt-1 font-medium">
                        {selectedProfile.dutyStation || "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl border p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Phone
                      </p>
                      <p className="mt-1 font-medium">
                        {selectedProfile.phone || "Not set"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select an employee profile before submitting.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaveBalanceQuery.isLoading ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading balance...
                </div>
              ) : leaveBalanceQuery.isError ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  Unable to load leave balances.
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border p-4">
                    <p className="text-sm text-muted-foreground">Balance Year</p>
                    <p className="mt-1 text-lg font-semibold">
                      {leaveBalanceQuery.data?.year}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {leaveBalanceQuery.data?.balances.map((balance) => (
                      <div
                        key={balance.leaveType}
                        className={`rounded-2xl border p-4 ${
                          balance.leaveType === formData.leaveType
                            ? "border-primary/40 bg-primary/5"
                            : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{balance.label}</p>
                            <p className="text-xs text-muted-foreground">
                              Notice: {balance.minNoticeDays} day
                              {balance.minNoticeDays === 1 ? "" : "s"}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {balance.leaveType}
                          </Badge>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                          <div>
                            <p className="text-muted-foreground">Allowance</p>
                            <p className="font-medium">
                              {balance.tracksBalance ? balance.allowance : "Policy based"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Used</p>
                            <p className="font-medium">{balance.used}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className="font-medium">
                              {balance.remaining ?? "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={missingProfileFields.length > 0 ? "border-destructive/30" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Submission Checks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Application date:{" "}
                <span className="font-medium text-foreground">
                  {format(new Date(), "PPP")}
                </span>
              </p>
              <p>
                Review ownership: HR can approve or reject once the request is
                submitted.
              </p>
              {selectedBalance && (
                <div className="rounded-2xl border p-4">
                  <p className="font-medium">{selectedBalance.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum notice: {selectedBalance.minNoticeDays} day
                    {selectedBalance.minNoticeDays === 1 ? "" : "s"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Remaining balance: {selectedBalance.remaining ?? "N/A"} day
                    {selectedBalance.remaining === 1 ? "" : "s"}
                  </p>
                </div>
              )}
              {holidaysInSelectedRange.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <p className="font-medium">Company holidays in this range</p>
                  <p className="mt-1 text-sm">
                    {holidaysInSelectedRange.map((holiday) => holiday.name).join(", ")}.
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    These dates are excluded from the working-day count.
                  </p>
                </div>
              )}
              {missingProfileFields.length > 0 ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
                  Complete the selected profile first. Missing:{" "}
                  {missingProfileFields.join(", ")}.
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  The selected profile has the required details for submission.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
