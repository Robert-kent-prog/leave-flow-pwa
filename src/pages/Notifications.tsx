import { useMemo, useState } from "react";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  Clock3,
  Info,
  Trash2,
} from "lucide-react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsData } from "@/hooks/useNotificationsData";
import { ApiNotification } from "@/types/api";

type NotificationFilter = "all" | "unread" | "important";

const getNotificationIcon = (type: ApiNotification["type"]) => {
  switch (type) {
    case "leave_approval":
      return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    case "leave_rejection":
      return <AlertCircle className="h-5 w-5 text-rose-600" />;
    case "new_request":
      return <Bell className="h-5 w-5 text-primary" />;
    case "reminder":
      return <Clock3 className="h-5 w-5 text-amber-600" />;
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />;
  }
};

const getPriorityBadge = (priority: ApiNotification["priority"]) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

const getTimestampLabel = (value: string) => {
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return `${formatDistanceToNowStrict(parsed, { addSuffix: true })}`;
};

export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState<NotificationFilter>("all");
  const {
    notifications,
    isLoading,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMutating,
  } = useNotificationsData();

  const unreadCount = notifications.filter((notification) => !notification.isRead)
    .length;
  const importantCount = notifications.filter(
    (notification) => notification.priority === "high" && !notification.isRead,
  ).length;

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((notification) => !notification.isRead);
      case "important":
        return notifications.filter((notification) => notification.priority === "high");
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const notificationsByType = useMemo(
    () =>
      notifications.reduce<Record<string, number>>((accumulator, notification) => {
        accumulator[notification.type] = (accumulator[notification.type] || 0) + 1;
        return accumulator;
      }, {}),
    [notifications],
  );

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read.",
      );
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update notification.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification removed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete notification.",
      );
    }
  };

  if (isError) {
    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle>Notifications Unavailable</CardTitle>
          <CardDescription>
            Live notification data could not be loaded from the backend.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Notification Center
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Track approvals, reminders, and system events from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isMutating}
          >
            Refresh
          </Button>
          <Button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isLoading || isMutating}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Unread</p>
            <p className="mt-2 text-3xl font-semibold">
              {isLoading ? "..." : unreadCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">High Priority</p>
            <p className="mt-2 text-3xl font-semibold">
              {isLoading ? "..." : importantCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Notifications</p>
            <p className="mt-2 text-3xl font-semibold">
              {isLoading ? "..." : notifications.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Incoming Activity</CardTitle>
                <CardDescription>
                  Notifications update from the live backend feed.
                </CardDescription>
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as NotificationFilter)}
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-[320px]">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="important">Important</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              {isLoading ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No notifications match the current filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        notification.isRead ? "bg-card" : "bg-primary/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-background p-2 shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{notification.title}</p>
                                {!notification.isRead && (
                                  <Badge variant="secondary">Unread</Badge>
                                )}
                                {getPriorityBadge(notification.priority)}
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {getTimestampLabel(notification.createdAt)}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                disabled={isMutating}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(notification._id)}
                              disabled={isMutating}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Mix</CardTitle>
              <CardDescription>
                Live distribution by event type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(notificationsByType).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No notification data is available yet.
                </p>
              ) : (
                Object.entries(notificationsByType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total received
                      </p>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Notes</CardTitle>
              <CardDescription>
                Notifications are now backed by the API instead of local demo data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Unread counts stay in sync with the global header badge.
              </p>
              <p>
                Actions such as mark-as-read and delete now persist through the
                backend.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
