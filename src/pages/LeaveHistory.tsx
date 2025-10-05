import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Check,
  X,
  MoreVertical,
  User,
  Clock,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface LeaveRequest {
  _id: string;
  employeeName: string;
  pno: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason: string;
  applicationDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  designation?: string;
  dutyStation?: string;
  phone?: string;
}

interface ActionModalState {
  isOpen: boolean;
  leaveRequest: LeaveRequest | null;
  action: "approve" | "reject" | "update" | "view" | null;
}

export default function LeaveHistory() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [modal, setModal] = useState<ActionModalState>({
    isOpen: false,
    leaveRequest: null,
    action: null,
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaveRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const API_BASE_URL = "http://10.6.224.235:9000/api";

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/leaves/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Error fetching Leave Requests:", error);
      toast({
        title: "Connection Error",
        description: "Failed to fetch leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (
    request: LeaveRequest,
    action: ActionModalState["action"]
  ) => {
    setModal({ isOpen: true, leaveRequest: request, action });
    setSelectedStatus(request.status);
    setComment(request.comments || "");
  };

  const closeModal = () => {
    setModal({ isOpen: false, leaveRequest: null, action: null });
    setComment("");
    setSelectedStatus("");
  };

  const handleStatusUpdate = async () => {
    if (!modal.leaveRequest || !user) {
      toast({
        title: "Error",
        description: "User information not available. Please login again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      interface UpdateData {
        status: string; // Adjust the type based on what `selectedStatus` is
        reviewedBy: string; // Assuming `user._id` is a string
        comments?: string; // Optional property
      }

      const updateData: UpdateData = {
        status: selectedStatus,
        reviewedBy: user._id,
      };

      // Only add reviewedBy if user exists and has _id
      if (user && user._id) {
        updateData.reviewedBy = user._id;
      }

      if (comment.trim()) {
        updateData.comments = comment;
      }

      const response = await fetch(
        `${API_BASE_URL}/leaves/${modal.leaveRequest._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const actionText =
        selectedStatus === "approved"
          ? "approved"
          : selectedStatus === "rejected"
          ? "rejected"
          : "updated";

      toast({
        title: `Leave ${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
        }`,
        description: `Leave request has been ${actionText} successfully`,
      });

      closeModal();
      fetchLeaveRequests();
    } catch (error) {
      console.error("Status update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update leave request",
        variant: "destructive",
      });
    }
  };

  const handleQuickApprove = async (id: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
      });
      return;
    }
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "approved",
          reviewedBy: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Leave Approved",
        description: "Leave request has been approved",
      });
      fetchLeaveRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    }
  };

  const handleQuickReject = async (id: string) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/leaves/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          reviewedBy: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Leave Rejected",
        description: "Leave request has been rejected",
      });
      fetchLeaveRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch =
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.pno.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    const matchesType =
      typeFilter === "all" || request.leaveType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Leave Management
          </h1>
          <p className="text-muted-foreground">
            Review and manage all leave requests
          </p>
        </div>
        <Button
          onClick={fetchLeaveRequests}
          variant="outline"
          className="shrink-0"
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by employee or P/No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="maternity">Maternity Leave</SelectItem>
                <SelectItem value="paternity">Paternity Leave</SelectItem>
                <SelectItem value="emergency">Emergency Leave</SelectItem>
                <SelectItem value="compassionate">Compassionate</SelectItem>
                <SelectItem value="study">Study Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">
                    Employee
                  </TableHead>
                  <TableHead className="hidden md:table-cell">P/No</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Leave Type
                  </TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="hidden sm:table-cell">Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Applied
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4 opacity-50" />
                        <p>No leave requests found</p>
                        <p className="text-sm mt-2">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          typeFilter !== "all"
                            ? "Try adjusting your filters"
                            : "No leave requests submitted yet"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request._id} className="group">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {request.employeeName}
                            </div>
                            <div className="text-sm text-muted-foreground sm:hidden">
                              {request.pno} • {request.leaveType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {request.pno}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell capitalize">
                        {request.leaveType.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(request.startDate)} -{" "}
                            {formatDate(request.endDate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {request.days}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(request.applicationDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Quick actions for pending requests */}
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleQuickApprove(request._id)}
                                className="h-8 px-2 hidden sm:flex"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleQuickReject(request._id)}
                                className="h-8 px-2 hidden sm:flex"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {/* More actions dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openModal(request, "view")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal(request, "update")}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              {request.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuickApprove(request._id)
                                    }
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Quick Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleQuickReject(request._id)
                                    }
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Quick Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Modal */}
      {modal.isOpen && modal.leaveRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {modal.action === "view" && "Leave Request Details"}
                {modal.action === "update" && "Update Leave Status"}
                {modal.action === "approve" && "Approve Leave Request"}
                {modal.action === "reject" && "Reject Leave Request"}
              </h3>

              {/* Leave Details */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employee:</span>
                    <p>{modal.leaveRequest.employeeName}</p>
                  </div>
                  <div>
                    <span className="font-medium">P/No:</span>
                    <p>{modal.leaveRequest.pno}</p>
                  </div>
                  <div>
                    <span className="font-medium">Leave Type:</span>
                    <p className="capitalize">{modal.leaveRequest.leaveType}</p>
                  </div>
                  <div>
                    <span className="font-medium">Days:</span>
                    <p>{modal.leaveRequest.days}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Period:</span>
                    <p>
                      {formatDate(modal.leaveRequest.startDate)} -{" "}
                      {formatDate(modal.leaveRequest.endDate)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Reason:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      {modal.leaveRequest.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Update Section */}
              {(modal.action === "update" ||
                modal.action === "approve" ||
                modal.action === "reject") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Comments {modal.action !== "update" && "(Optional)"}
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Enter comments for this action..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* View Only Section */}
              {modal.action === "view" && modal.leaveRequest.comments && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Review Comments
                  </label>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {modal.leaveRequest.comments}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                {(modal.action === "update" ||
                  modal.action === "approve" ||
                  modal.action === "reject") && (
                  <Button onClick={handleStatusUpdate}>
                    {modal.action === "approve"
                      ? "Approve"
                      : modal.action === "reject"
                      ? "Reject"
                      : "Update"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
