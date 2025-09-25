import { useState } from "react";
import {
  Bell,
  Check,
  Filter,
  Archive,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Dummy notification data
const notificationsData = [
  {
    id: 1,
    type: "leave_approval",
    title: "Leave Request Approved",
    message:
      "Your annual leave request for Dec 15-22 has been approved by HR Manager",
    timestamp: "2 minutes ago",
    read: false,
    priority: "high",
  },
  {
    id: 2,
    type: "leave_rejection",
    title: "Leave Request Rejected",
    message:
      "Your sick leave request for Jan 5-7 was rejected due to insufficient documentation",
    timestamp: "1 hour ago",
    read: false,
    priority: "high",
  },
  {
    id: 3,
    type: "new_request",
    title: "New Leave Request",
    message: "John Doe has submitted a new paternity leave request for review",
    timestamp: "3 hours ago",
    read: true,
    priority: "medium",
  },
  {
    id: 4,
    type: "reminder",
    title: "Leave Balance Reminder",
    message: "You have 12 annual leave days remaining this year",
    timestamp: "5 hours ago",
    read: true,
    priority: "low",
  },
  {
    id: 5,
    type: "system",
    title: "System Maintenance",
    message:
      "Scheduled maintenance this weekend. System will be unavailable from 10 PM to 2 AM",
    timestamp: "1 day ago",
    read: true,
    priority: "medium",
  },
  {
    id: 6,
    type: "leave_approval",
    title: "Leave Request Approved",
    message: "Your maternity leave request has been approved and scheduled",
    timestamp: "2 days ago",
    read: true,
    priority: "high",
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(notificationsData);
  const [activeTab, setActiveTab] = useState("all");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read
  ).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "leave_approval":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "leave_rejection":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "new_request":
        return <Bell className="h-5 w-5 text-blue-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className="text-xs">
            Medium
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Low
          </Badge>
        );
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.priority === "high");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={markAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 px-3 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl">
                  Your Notifications
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 px-2 py-1 text-xs sm:text-sm"
                  >
                    {unreadCount} unread
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 px-2 py-1 text-xs sm:text-sm"
                  >
                    {highPriorityCount} important
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Recent notifications from your leave management system
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-4 h-10 sm:h-12">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs sm:text-sm">
                    Unread
                  </TabsTrigger>
                  <TabsTrigger value="important" className="text-xs sm:text-sm">
                    Important
                  </TabsTrigger>
                </TabsList>

                {/* Dynamically sized scroll area — max 70vh on mobile, 500px on desktop */}
                <ScrollArea className="h-[40vh] sm:h-[50vh] md:h-[500px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-muted-foreground px-2">
                      <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base font-medium">
                        No notifications found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4 pr-1">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                            !notification.read
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-border"
                          }`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="mt-1 flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                <h3 className="font-semibold text-sm sm:text-base leading-tight">
                                  {notification.title}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                                  {getPriorityBadge(notification.priority)}
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {notification.timestamp}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="h-8 px-2 text-xs sm:text-sm font-medium"
                                  >
                                    <Check className="mr-1.5 h-3.5 w-3.5" />
                                    Mark as read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="h-8 px-2 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Notification Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Leave approvals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Leave rejections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">New requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Reminders</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={markAllAsRead}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={clearAll}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive all
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="mr-2 h-4 w-4" />
                Configure filters
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
