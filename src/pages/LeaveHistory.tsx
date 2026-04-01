import { useContext, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Clock3,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  PencilLine,
  Search,
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
import { Textarea } from "@/components/ui/textarea";
import { ApiContext, AuthContext } from "@/contexts/AuthContextInstance";
import { useLeaveRecords } from "@/hooks/useLeaveRecords";
import { isHrRole } from "@/lib/roles";
import type { ApiLeaveHistoryEntry, ApiLeaveRecord, ApiSystemUser } from "@/types/api";

const formatDate = (value?: string) => {
  if (!value) {
    return "Not set";
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? "Invalid date" : format(parsed, "PPP");
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not set";
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? "Invalid date" : format(parsed, "PPP p");
};

const formatActor = (actor?: string | ApiSystemUser) => {
  if (!actor) {
    return "System";
  }

  if (typeof actor === "string") {
    return "User";
  }

  return actor.username;
};

const formatAction = (action: ApiLeaveHistoryEntry["action"]) =>
  action.charAt(0).toUpperCase() + action.slice(1);

const toInputDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
};

const getStatusBadge = (status: ApiLeaveRecord["status"]) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>;
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "cancelled":
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

type EditableRequestState = {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const emptyEditState: EditableRequestState = {
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
};

export default function LeaveHistory() {
  const authContext = useContext(AuthContext);
  const apiContext = useContext(ApiContext);
  const queryClient = useQueryClient();

  if (!authContext || !apiContext) {
    throw new Error("LeaveHistory must be used within the auth and API providers");
  }

  const { user } = authContext;
  const { updateLeaveRequest, cancelLeaveRequest } = apiContext;
  const isHrView = isHrRole(user?.role);
  const leaveRecordsQuery = useLeaveRecords(undefined, {
    scope: isHrView ? "all" : "mine",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApiLeaveRecord | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">(
    "approved",
  );
  const [reviewComment, setReviewComment] = useState("");
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editRequestForm, setEditRequestForm] =
    useState<EditableRequestState>(emptyEditState);

  const leaveRequests = useMemo(
    () => leaveRecordsQuery.data ?? [],
    [leaveRecordsQuery.data],
  );

  const leaveTypes = useMemo(
    () => Array.from(new Set(leaveRequests.map((request) => request.leaveType))).sort(),
    [leaveRequests],
  );

  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter((request) => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const matchesSearch =
          normalizedSearch.length === 0 ||
          request.employeeName.toLowerCase().includes(normalizedSearch) ||
          request.pno.toLowerCase().includes(normalizedSearch) ||
          request.leaveType.toLowerCase().includes(normalizedSearch) ||
          request.reason.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "all" || request.status === statusFilter;
        const matchesType =
          typeFilter === "all" || request.leaveType === typeFilter;

        const requestStart = parseISO(request.startDate);
        const requestEnd = parseISO(request.endDate);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDateValue = dateTo ? new Date(dateTo) : null;

        const matchesDateFrom =
          !fromDate ||
          !Number.isNaN(requestEnd.getTime()) && requestEnd >= fromDate;
        const matchesDateTo =
          !toDateValue ||
          !Number.isNaN(requestStart.getTime()) && requestStart <= toDateValue;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType &&
          matchesDateFrom &&
          matchesDateTo
        );
      }),
    [dateFrom, dateTo, leaveRequests, searchTerm, statusFilter, typeFilter],
  );

  const selectedRequestCanReview =
    Boolean(selectedRequest) && isHrView && selectedRequest?.status === "pending";
  const selectedRequestCanEdit =
    Boolean(selectedRequest) && !isHrView && selectedRequest?.status === "pending";
  const selectedRequestCanCancel =
    Boolean(selectedRequest) &&
    !isHrView &&
    (selectedRequest?.status === "pending" || selectedRequest?.status === "approved");

  const openDetails = (request: ApiLeaveRecord, startEdit = false) => {
    setSelectedRequest(request);
    setReviewStatus("approved");
    setReviewComment(request.comments || "");
    setEditRequestForm({
      leaveType: request.leaveType,
      startDate: toInputDate(request.startDate),
      endDate: toInputDate(request.endDate),
      reason: request.reason,
    });
    setIsEditingRequest(startEdit);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
    setReviewStatus("approved");
    setReviewComment("");
    setIsEditingRequest(false);
    setEditRequestForm(emptyEditState);
  };

  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["leave-records"] }),
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  };

  const handleReview = async () => {
    if (!selectedRequest) {
      return;
    }

    setActiveRequestId(selectedRequest._id);

    try {
      await updateLeaveRequest(selectedRequest._id, {
        status: reviewStatus,
        comments: reviewComment.trim() || undefined,
      });
      await refreshData();
      toast.success(`Leave request ${reviewStatus}.`);
      closeDetails();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Unable to mark leave as ${reviewStatus}.`,
      );
    } finally {
      setActiveRequestId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest) {
      return;
    }

    if (
      !editRequestForm.leaveType ||
      !editRequestForm.startDate ||
      !editRequestForm.endDate ||
      !editRequestForm.reason.trim()
    ) {
      toast.error("Complete the leave type, date range, and reason.");
      return;
    }

    if (new Date(editRequestForm.startDate) > new Date(editRequestForm.endDate)) {
      toast.error("End date must be on or after the start date.");
      return;
    }

    setActiveRequestId(selectedRequest._id);

    try {
      await updateLeaveRequest(selectedRequest._id, {
        leaveType: editRequestForm.leaveType,
        startDate: editRequestForm.startDate,
        endDate: editRequestForm.endDate,
        reason: editRequestForm.reason.trim(),
      });
      await refreshData();
      toast.success("Pending leave request updated.");
      closeDetails();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update request.",
      );
    } finally {
      setActiveRequestId(null);
    }
  };

  const handleCancel = async (leaveRequestId: string) => {
    setActiveRequestId(leaveRequestId);

    try {
      await cancelLeaveRequest(leaveRequestId);
      await refreshData();
      toast.success("Leave request cancelled.");
      if (selectedRequest?._id === leaveRequestId) {
        closeDetails();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel request.",
      );
    } finally {
      setActiveRequestId(null);
    }
  };

  const headerTitle = isHrView ? "Leave Requests" : "My Leave History";
  const headerDescription = isHrView
    ? "Review, approve, reject, and track all submitted leave requests."
    : "Track your requests, edit pending submissions, and review the full status timeline.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{headerTitle}</h1>
        <p className="text-sm text-muted-foreground">{headerDescription}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-2 xl:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={
                  isHrView
                    ? "Search employee, P/No, type, or reason"
                    : "Search type or reason"
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Leave Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All leave types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All leave types</SelectItem>
                  {leaveTypes.map((leaveType) => (
                    <SelectItem key={leaveType} value={leaveType}>
                      {leaveType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>

            <div className="space-y-2 xl:col-start-5">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Log
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredRequests.length} request
              {filteredRequests.length === 1 ? "" : "s"} shown.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => leaveRecordsQuery.refetch()}
            disabled={leaveRecordsQuery.isFetching}
          >
            {leaveRecordsQuery.isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : (
              "Refresh"
            )}
          </Button>
        </CardHeader>

        <CardContent>
          {leaveRecordsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading leave requests...
            </div>
          ) : leaveRecordsQuery.isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
              Unable to load leave requests from the backend.
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No leave requests match the current filters.
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Window</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead className="w-[260px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => {
                      const isBusy = activeRequestId === request._id;
                      const canEdit = !isHrView && request.status === "pending";
                      const canCancel =
                        !isHrView &&
                        (request.status === "pending" ||
                          request.status === "approved");

                      return (
                        <TableRow key={request._id}>
                          <TableCell>
                            <div className="font-medium">{request.employeeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.pno}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{formatDate(request.startDate)}</div>
                            <div className="text-sm text-muted-foreground">
                              to {formatDate(request.endDate)}
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {request.leaveType}
                          </TableCell>
                          <TableCell>{request.days}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {formatDate(request.applicationDate || request.createdAt)}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate">
                            {request.comments || "No review comments"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openDetails(request)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openDetails(request, true)}
                                >
                                  <PencilLine className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                              )}
                              {canCancel && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancel(request._id)}
                                  disabled={isBusy}
                                >
                                  {isBusy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Cancel"
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 lg:hidden">
                {filteredRequests.map((request) => {
                  const isBusy = activeRequestId === request._id;
                  const canEdit = !isHrView && request.status === "pending";
                  const canCancel =
                    !isHrView &&
                    (request.status === "pending" || request.status === "approved");

                  return (
                    <Card key={request._id} className="border border-border/70 shadow-none">
                      <CardContent className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{request.employeeName}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.pno}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        <div className="grid gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock3 className="h-4 w-4" />
                            <span>
                              {formatDate(request.startDate)} to{" "}
                              {formatDate(request.endDate)}
                            </span>
                          </div>
                          <div className="capitalize text-muted-foreground">
                            {request.leaveType} • {request.days} working days
                          </div>
                          <p>{request.reason}</p>
                          {request.comments && (
                            <div className="rounded-2xl border p-3 text-sm">
                              <p className="font-medium">Review comments</p>
                              <p className="mt-1 text-muted-foreground">
                                {request.comments}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          <Button
                            variant="outline"
                            onClick={() => openDetails(request)}
                          >
                            View Details
                          </Button>
                          {canEdit && (
                            <Button
                              variant="outline"
                              onClick={() => openDetails(request, true)}
                            >
                              Edit Request
                            </Button>
                          )}
                          {canCancel ? (
                            <Button
                              variant="outline"
                              onClick={() => handleCancel(request._id)}
                              disabled={isBusy}
                            >
                              Cancel
                            </Button>
                          ) : (
                            <div />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && closeDetails()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditingRequest ? "Edit Pending Leave Request" : "Leave Request Details"}
            </DialogTitle>
            <DialogDescription>
              {isEditingRequest
                ? "Update the pending request before HR reviews it."
                : "Review request details, comments, and the request history trail."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="mt-1 text-lg font-semibold">
                    {selectedRequest.employeeName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.pno}
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-2">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Leave Window</p>
                  <p className="mt-1 font-medium">
                    {formatDate(selectedRequest.startDate)} to{" "}
                    {formatDate(selectedRequest.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequest.days} working days
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="mt-1 font-medium">
                    {formatDateTime(
                      selectedRequest.applicationDate || selectedRequest.createdAt,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedRequest.leaveType}
                  </p>
                </div>
              </div>

              {isEditingRequest && selectedRequestCanEdit ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-leave-type">Leave Type</Label>
                    <Select
                      value={editRequestForm.leaveType}
                      onValueChange={(value) =>
                        setEditRequestForm((current) => ({
                          ...current,
                          leaveType: value,
                        }))
                      }
                    >
                      <SelectTrigger id="edit-leave-type">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((leaveType) => (
                          <SelectItem key={leaveType} value={leaveType}>
                            {leaveType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-date">Start Date</Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editRequestForm.startDate}
                      onChange={(event) =>
                        setEditRequestForm((current) => ({
                          ...current,
                          startDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-date">End Date</Label>
                    <Input
                      id="edit-end-date"
                      type="date"
                      value={editRequestForm.endDate}
                      onChange={(event) =>
                        setEditRequestForm((current) => ({
                          ...current,
                          endDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-reason">Reason</Label>
                    <Textarea
                      id="edit-reason"
                      value={editRequestForm.reason}
                      onChange={(event) =>
                        setEditRequestForm((current) => ({
                          ...current,
                          reason: event.target.value,
                        }))
                      }
                      className="min-h-28"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-4">
                  <p className="font-medium">Reason</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Review Comments</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedRequest.comments || "No review comments yet."}
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium">Request History</p>
                {(selectedRequest.history ?? []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                    No history entries recorded.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedRequest.history ?? []).map((entry, index) => (
                      <div key={`${entry.timestamp}-${index}`} className="rounded-2xl border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{formatAction(entry.action)}</Badge>
                            {getStatusBadge(entry.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          By {formatActor(entry.actor)}
                        </p>
                        {entry.comment && (
                          <p className="mt-2 text-sm">{entry.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedRequestCanReview && (
                <div className="space-y-4 rounded-2xl border p-4">
                  <p className="font-medium">HR Review</p>
                  <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Decision</label>
                      <Select
                        value={reviewStatus}
                        onValueChange={(value) =>
                          setReviewStatus(value as "approved" | "rejected")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select decision" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comments</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                        placeholder="Add review notes. Rejection requires a comment."
                        className="min-h-28"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedRequestCanCancel && selectedRequest ? (
              <Button
                variant="outline"
                onClick={() => handleCancel(selectedRequest._id)}
                disabled={activeRequestId === selectedRequest._id}
              >
                {activeRequestId === selectedRequest._id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling
                  </>
                ) : (
                  "Cancel Request"
                )}
              </Button>
            ) : null}

            {selectedRequestCanEdit && selectedRequest && !isEditingRequest ? (
              <Button variant="outline" onClick={() => setIsEditingRequest(true)}>
                Edit Pending Request
              </Button>
            ) : null}

            {selectedRequestCanEdit && selectedRequest && isEditingRequest ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingRequest(false)}
                  disabled={activeRequestId === selectedRequest._id}
                >
                  Back to Details
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={activeRequestId === selectedRequest._id}
                >
                  {activeRequestId === selectedRequest._id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : null}

            {selectedRequestCanReview ? (
              <Button
                onClick={handleReview}
                disabled={activeRequestId === selectedRequest?._id}
              >
                {activeRequestId === selectedRequest?._id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : reviewStatus === "approved" ? (
                  "Approve Request"
                ) : (
                  "Reject Request"
                )}
              </Button>
            ) : null}

            {!selectedRequestCanReview && !selectedRequestCanEdit ? (
              <Button variant="outline" onClick={closeDetails}>
                Close
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
