import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, isWithinInterval, parseISO } from "date-fns";
import {
  Calendar,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeesDirectory } from "@/hooks/useEmployeesDirectory";
import { useLeaveRecords } from "@/hooks/useLeaveRecords";
import { useSystemUsers } from "@/hooks/useSystemUsers";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { ApiLeaveRecord, ApiSystemUser, SystemRole } from "@/types/api";

const parseRecordDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: string) => {
  const parsed = parseRecordDate(value);
  return parsed ? format(parsed, "PPP") : "Not available";
};

const isCurrentlyOnLeave = (records: ApiLeaveRecord[], today: Date) =>
  records.some((record) => {
    const startDate = parseRecordDate(record.startDate);
    const endDate = parseRecordDate(record.endDate);

    if (!startDate || !endDate || record.status !== "approved") {
      return false;
    }

    return isWithinInterval(today, { start: startDate, end: endDate });
  });

const roleOptions: { value: SystemRole; label: string }[] = [
  { value: "employee", label: "Employee" },
  { value: "assistant_hr", label: "Assistant HR" },
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
];

type CreateUserFormState = {
  username: string;
  staffId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  dutyStation: string;
  password: string;
  role: SystemRole;
};

const defaultCreateUserForm: CreateUserFormState = {
  username: "",
  staffId: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  dutyStation: "",
  password: "",
  role: "employee",
};

const formatRoleLabel = (role: SystemRole) =>
  role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default function EmployeesDirectory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserForm, setCreateUserForm] =
    useState<CreateUserFormState>(defaultCreateUserForm);

  const isAdmin = user?.role === "admin";
  const systemUsersQuery = useSystemUsers(undefined, isAdmin);
  const employeesQuery = useEmployeesDirectory(!isAdmin);
  const leaveRecordsQuery = useLeaveRecords(undefined, { scope: "all" });
  const today = useMemo(() => new Date(), []);

  const baseUsers = useMemo(() => {
    if (isAdmin) {
      return (systemUsersQuery.data ?? []).map((account) => ({
        ...account,
        employeeName: account.username,
        pno: account.staffId,
      }));
    }

    return employeesQuery.data ?? [];
  }, [employeesQuery.data, isAdmin, systemUsersQuery.data]);

  const leaveRecords = useMemo(
    () => leaveRecordsQuery.data ?? [],
    [leaveRecordsQuery.data],
  );

  const activeUsersQuery = isAdmin ? systemUsersQuery : employeesQuery;
  const isLoading = activeUsersQuery.isLoading || leaveRecordsQuery.isLoading;
  const hasError = activeUsersQuery.isError || leaveRecordsQuery.isError;

  const directoryRecords = useMemo(() => {
    return baseUsers.map((account) => {
      const employeeRequests = leaveRecords.filter(
        (record) => record.pno === account.pno,
      );

      const approvedRecords = employeeRequests.filter(
        (record) => record.status === "approved",
      );
      const pendingRecords = employeeRequests.filter(
        (record) => record.status === "pending",
      );
      const totalUsedLeaveDays = approvedRecords.reduce(
        (total, record) => total + (record.days || 0),
        0,
      );
      const lastRequest = [...employeeRequests].sort((a, b) => {
        const left = parseRecordDate(a.startDate)?.getTime() ?? 0;
        const right = parseRecordDate(b.startDate)?.getTime() ?? 0;
        return right - left;
      })[0];

      const currentStatus = account.isActive === false
        ? "inactive"
        : isCurrentlyOnLeave(employeeRequests, today)
          ? "on-leave"
          : "active";

      return {
        ...account,
        currentStatus,
        pendingRequests: pendingRecords.length,
        approvedRequests: approvedRecords.length,
        totalUsedLeaveDays,
        estimatedAnnualBalance: Math.max(21 - totalUsedLeaveDays, 0),
        lastRequest,
      };
    });
  }, [baseUsers, leaveRecords, today]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return directoryRecords;
    }

    return directoryRecords.filter((account) => {
      return (
        account.employeeName.toLowerCase().includes(search) ||
        account.pno.toLowerCase().includes(search) ||
        account.email.toLowerCase().includes(search) ||
        account.role.toLowerCase().includes(search) ||
        (account.department || "").toLowerCase().includes(search) ||
        (account.designation || "").toLowerCase().includes(search) ||
        (account.dutyStation || "").toLowerCase().includes(search)
      );
    });
  }, [directoryRecords, searchTerm]);

  const getStatusBadge = (status: "active" | "on-leave" | "inactive") => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>;
      case "on-leave":
        return <Badge variant="secondary">On Leave</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const resetCreateUserForm = () => {
    setCreateUserForm(defaultCreateUserForm);
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingUser(true);

    try {
      await apiFetch("/system_users", {
        method: "POST",
        body: JSON.stringify({
          username: createUserForm.username.trim(),
          staffId: createUserForm.staffId.trim(),
          email: createUserForm.email.trim().toLowerCase(),
          phone: createUserForm.phone.trim(),
          department: createUserForm.department.trim() || undefined,
          designation: createUserForm.designation.trim() || undefined,
          dutyStation: createUserForm.dutyStation.trim() || undefined,
          password: createUserForm.password,
          role: createUserForm.role,
        }),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system-users"] }),
        queryClient.invalidateQueries({ queryKey: ["employees-directory"] }),
      ]);

      toast.success(
        `${formatRoleLabel(createUserForm.role)} account created successfully.`,
      );
      setIsCreateDialogOpen(false);
      resetCreateUserForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account.",
      );
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading accounts...
      </div>
    );
  }

  if (hasError) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>Directory Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={() => activeUsersQuery.refetch()}>Reload Accounts</Button>
          <Button variant="outline" onClick={() => leaveRecordsQuery.refetch()}>
            Reload Leave Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isAdmin ? "User Management" : "Employee Directory"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin
              ? "Create and review system accounts for employees, HR, assistant HR, and admins."
              : "Employee accounts, leave activity, and current availability in one view."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              activeUsersQuery.refetch();
              leaveRecordsQuery.refetch();
            }}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isAdmin && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Admin-managed account creation</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Public signup remains employee-only. HR, assistant HR, and
                  admin accounts should be created internally from this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, staff ID, email, department, designation, duty station, or role"
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  {isAdmin && <TableHead>Role</TableHead>}
                  <TableHead>Contact</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leave Activity</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((account) => (
                  <TableRow key={account._id}>
                    <TableCell>
                      <div className="font-medium">{account.employeeName}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.pno}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Badge variant="outline">
                          {formatRoleLabel(account.role)}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-sm">{account.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{account.department || "Not set"}</div>
                      <div className="text-sm text-muted-foreground">
                        {(account.designation || "No designation")} •{" "}
                        {account.dutyStation || "No duty station"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(account.currentStatus)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        Approved: {account.approvedRequests}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending: {account.pendingRequests} • Used:{" "}
                        {account.totalUsedLeaveDays} days
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Est. balance: {account.estimatedAnnualBalance} days
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.lastLogin ? formatDate(account.lastLogin) : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:hidden">
        {filteredUsers.map((account) => (
          <Card key={account._id}>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{account.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{account.pno}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isAdmin && (
                    <Badge variant="outline">
                      {formatRoleLabel(account.role)}
                    </Badge>
                  )}
                  {getStatusBadge(account.currentStatus)}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{account.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{account.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {account.department || "No department"} •{" "}
                    {account.designation || "No designation"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{account.dutyStation || "No duty station"}</span>
                </div>
              </div>

              <div className="rounded-2xl border p-4 text-sm">
                <p className="font-medium">Leave Activity</p>
                <p className="mt-2 text-muted-foreground">
                  Approved: {account.approvedRequests} • Pending:{" "}
                  {account.pendingRequests}
                </p>
                <p className="text-muted-foreground">
                  Used: {account.totalUsedLeaveDays} days • Estimated balance:{" "}
                  {account.estimatedAnnualBalance} days
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            resetCreateUserForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
            <DialogDescription>
              Admins can provision employee, HR, assistant HR, and admin
              accounts from this internal form.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={createUserForm.role}
                onValueChange={(value) =>
                  setCreateUserForm((current) => ({
                    ...current,
                    role: value as SystemRole,
                  }))
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {[
              { key: "username", label: "Full Name", type: "text" },
              { key: "staffId", label: "Staff ID", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone Number", type: "text" },
              { key: "department", label: "Department", type: "text" },
              { key: "designation", label: "Designation", type: "text" },
              { key: "dutyStation", label: "Duty Station", type: "text" },
              { key: "password", label: "Temporary Password", type: "password" },
            ].map((field) => (
              <div
                key={field.key}
                className={
                  field.key === "dutyStation" ? "space-y-2 md:col-span-2" : "space-y-2"
                }
              >
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={
                    createUserForm[field.key as keyof CreateUserFormState] as string
                  }
                  onChange={(event) =>
                    setCreateUserForm((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                  required={
                    ["username", "staffId", "email", "phone", "password"].includes(
                      field.key,
                    ) ||
                    createUserForm.role === "employee"
                  }
                />
              </div>
            ))}

            <DialogFooter className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreatingUser}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingUser}>
                {isCreatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
