import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  Filter,
  Landmark,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { format, getMonth, getYear, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCompanyHolidays } from "@/hooks/useCompanyHolidays";
import { useLeaveRecords } from "@/hooks/useLeaveRecords";
import { apiFetch } from "@/lib/api";
import { isHrRole } from "@/lib/roles";
import type { ApiHoliday, ApiLeaveRecord } from "@/types/api";

const parseDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStatusVariant = (status: ApiLeaveRecord["status"]) => {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
};

type HolidayFormState = {
  name: string;
  date: string;
  type: "public" | "company";
  description: string;
};

const defaultHolidayForm: HolidayFormState = {
  name: "",
  date: "",
  type: "company",
  description: "",
};

export default function LeaveCalendarPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManageHolidays = isHrRole(user?.role);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState<HolidayFormState>(defaultHolidayForm);
  const [isSavingHoliday, setIsSavingHoliday] = useState(false);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(null);

  const leaveRecordsQuery = useLeaveRecords();
  const holidaysQuery = useCompanyHolidays();
  const leaveRecords = useMemo(
    () => leaveRecordsQuery.data ?? [],
    [leaveRecordsQuery.data],
  );
  const holidays = useMemo(() => holidaysQuery.data ?? [], [holidaysQuery.data]);

  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear()]);

    leaveRecords.forEach((record) => {
      const parsed = parseDate(record.startDate);
      if (parsed) {
        years.add(getYear(parsed));
      }
    });

    holidays.forEach((holiday) => {
      const parsed = parseDate(holiday.date);
      if (parsed) {
        years.add(getYear(parsed));
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [holidays, leaveRecords]);

  const leaveTypes = useMemo(
    () => Array.from(new Set(leaveRecords.map((record) => record.leaveType))).sort(),
    [leaveRecords],
  );

  const filteredRecords = useMemo(
    () =>
      leaveRecords.filter((record) => {
        const startDate = parseDate(record.startDate);
        if (!startDate) {
          return false;
        }

        const yearMatch =
          selectedYear === "all" || getYear(startDate).toString() === selectedYear;
        const monthMatch =
          selectedMonth === "all" || getMonth(startDate).toString() === selectedMonth;
        const typeMatch = selectedType === "all" || record.leaveType === selectedType;
        const statusMatch =
          selectedStatus === "all" || record.status === selectedStatus;

        return yearMatch && monthMatch && typeMatch && statusMatch;
      }),
    [leaveRecords, selectedMonth, selectedStatus, selectedType, selectedYear],
  );

  const filteredHolidays = useMemo(
    () =>
      holidays.filter((holiday) => {
        const holidayDate = parseDate(holiday.date);
        if (!holidayDate) {
          return false;
        }

        const yearMatch =
          selectedYear === "all" || getYear(holidayDate).toString() === selectedYear;
        const monthMatch =
          selectedMonth === "all" || getMonth(holidayDate).toString() === selectedMonth;

        return yearMatch && monthMatch;
      }),
    [holidays, selectedMonth, selectedYear],
  );

  const selectedDayRecords = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return filteredRecords.filter((record) => {
      const startDate = parseDate(record.startDate);
      const endDate = parseDate(record.endDate);
      if (!startDate || !endDate) {
        return false;
      }

      return isWithinInterval(selectedDate, { start: startDate, end: endDate });
    });
  }, [filteredRecords, selectedDate]);

  const selectedDayHolidays = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return filteredHolidays.filter((holiday) => {
      const holidayDate = parseDate(holiday.date);
      return holidayDate ? isSameDay(holidayDate, selectedDate) : false;
    });
  }, [filteredHolidays, selectedDate]);

  const highlightedDays = useMemo(() => {
    const dates: Date[] = [];

    filteredRecords.forEach((record) => {
      const startDate = parseDate(record.startDate);
      const endDate = parseDate(record.endDate);

      if (!startDate || !endDate) {
        return;
      }

      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return dates;
  }, [filteredRecords]);

  const holidayDates = useMemo(
    () =>
      filteredHolidays
        .map((holiday) => parseDate(holiday.date))
        .filter((date): date is Date => Boolean(date)),
    [filteredHolidays],
  );

  const summary = useMemo(() => {
    const totalLeaveDays = filteredRecords.reduce(
      (sum, record) => sum + (record.days || 0),
      0,
    );
    const employeesScheduled = new Set(filteredRecords.map((record) => record.pno))
      .size;
    const pendingApprovals = filteredRecords.filter(
      (record) => record.status === "pending",
    ).length;

    return {
      totalLeaveDays,
      employeesScheduled,
      pendingApprovals,
      companyHolidays: filteredHolidays.length,
    };
  }, [filteredHolidays.length, filteredRecords]);

  const selectedMonthLabel =
    selectedMonth === "all"
      ? "All months"
      : format(new Date(2024, Number(selectedMonth), 1), "MMMM");

  const calendarMonth = new Date(
    selectedYear === "all" ? new Date().getFullYear() : Number(selectedYear),
    selectedMonth === "all"
      ? selectedDate?.getMonth() ?? new Date().getMonth()
      : Number(selectedMonth),
    1,
  );

  const resetHolidayForm = () => {
    setHolidayForm(defaultHolidayForm);
  };

  const handleCreateHoliday = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingHoliday(true);

    try {
      await apiFetch<{ message: string; holiday: ApiHoliday }>("/holidays", {
        method: "POST",
        body: JSON.stringify(holidayForm),
      });

      await queryClient.invalidateQueries({ queryKey: ["company-holidays"] });
      toast.success("Holiday added to the company calendar.");
      setIsHolidayDialogOpen(false);
      resetHolidayForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create holiday.",
      );
    } finally {
      setIsSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    setDeletingHolidayId(holidayId);

    try {
      await apiFetch<{ message: string }>(`/holidays/${holidayId}`, {
        method: "DELETE",
      });
      await queryClient.invalidateQueries({ queryKey: ["company-holidays"] });
      toast.success("Holiday removed from the company calendar.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete holiday.",
      );
    } finally {
      setDeletingHolidayId(null);
    }
  };

  const isLoading = leaveRecordsQuery.isLoading || holidaysQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Leave Calendar</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Real-time leave coverage and company holiday planning from one calendar.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canManageHolidays && (
            <Button
              variant="outline"
              onClick={() => setIsHolidayDialogOpen(true)}
            >
              <Landmark className="mr-2 h-4 w-4" />
              Add Holiday
            </Button>
          )}
          <Button asChild>
            <Link to="/request">
              <Plus className="mr-2 h-4 w-4" />
              Create Request
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Scheduled Days</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : summary.totalLeaveDays}
              </p>
            </div>
            <Clock3 className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Employees Scheduled</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : summary.employeesScheduled}
              </p>
            </div>
            <Users className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : summary.pendingApprovals}
              </p>
            </div>
            <Filter className="h-5 w-5 text-amber-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">Company Holidays</p>
              <p className="mt-2 text-3xl font-semibold">
                {isLoading ? "..." : summary.companyHolidays}
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-rose-600" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Filters</CardTitle>
          <CardDescription>
            Current scope: {selectedMonthLabel}
            {selectedYear === "all" ? "" : ` ${selectedYear}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {Array.from({ length: 12 }).map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {format(new Date(2024, index, 1), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Leave Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All leave types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All leave types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>
              Leave days appear in blue. Company holidays appear in rose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              month={calendarMonth}
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={setSelectedDate}
              modifiers={{ scheduled: highlightedDays, holiday: holidayDates }}
              modifiersClassNames={{
                scheduled: "bg-primary/10 text-primary font-semibold rounded-md",
                holiday:
                  "bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200",
              }}
              className="rounded-2xl border p-4"
            />
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary/30" />
                Leave scheduled
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-300" />
                Company holiday
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate ? format(selectedDate, "EEEE, MMM d") : "Selected Day"}
              </CardTitle>
              <CardDescription>
                Leave coverage and holiday entries for the selected date.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayHolidays.map((holiday) => (
                <div
                  key={holiday._id}
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{holiday.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {holiday.type === "public" ? "Public holiday" : "Company holiday"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {holiday.type}
                    </Badge>
                  </div>
                  {holiday.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {holiday.description}
                    </p>
                  )}
                </div>
              ))}

              {!selectedDate || selectedDayRecords.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No leave records overlap the currently selected date.
                </div>
              ) : (
                selectedDayRecords.map((record) => (
                  <div key={record._id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{record.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.leaveType} • {record.dutyStation}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusVariant(record.status)}
                        className="capitalize"
                      >
                        {record.status}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {format(parseISO(record.startDate), "MMM d")} to{" "}
                      {format(parseISO(record.endDate), "MMM d")} • {record.days} working days
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Holidays</CardTitle>
              <CardDescription>
                Holidays under the current year and month filters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredHolidays.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No holidays match the current calendar scope.
                </div>
              ) : (
                filteredHolidays.map((holiday) => (
                  <div key={holiday._id} className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{holiday.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(holiday.date), "PPP")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {holiday.type}
                        </Badge>
                        {canManageHolidays && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteHoliday(holiday._id)}
                            disabled={deletingHolidayId === holiday._id}
                          >
                            {deletingHolidayId === holiday._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {holiday.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {holiday.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isHolidayDialogOpen}
        onOpenChange={(open) => {
          setIsHolidayDialogOpen(open);
          if (!open) {
            resetHolidayForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Company Holiday</DialogTitle>
            <DialogDescription>
              HR can register public or internal company holidays so they are excluded
              from leave working-day calculations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHoliday} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-name">Holiday name</Label>
              <Input
                id="holiday-name"
                value={holidayForm.name}
                onChange={(event) =>
                  setHolidayForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="holiday-date">Date</Label>
                <Input
                  id="holiday-date"
                  type="date"
                  value={holidayForm.date}
                  onChange={(event) =>
                    setHolidayForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holiday-type">Type</Label>
                <Select
                  value={holidayForm.type}
                  onValueChange={(value) =>
                    setHolidayForm((current) => ({
                      ...current,
                      type: value as "public" | "company",
                    }))
                  }
                >
                  <SelectTrigger id="holiday-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company holiday</SelectItem>
                    <SelectItem value="public">Public holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="holiday-description">Description</Label>
              <Textarea
                id="holiday-description"
                value={holidayForm.description}
                onChange={(event) =>
                  setHolidayForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional notes for employees and HR."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsHolidayDialogOpen(false)}
                disabled={isSavingHoliday}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingHoliday}>
                {isSavingHoliday ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save Holiday"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
