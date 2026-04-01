import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ApiNotification } from "@/types/api";

const queryKey = ["notifications"];

export function useNotificationsData() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () => apiFetch<ApiNotification[]>("/notifications"),
    staleTime: 30_000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<ApiNotification>(`/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ message: string; updatedCount: number }>(
        "/notifications/read-all",
        {
          method: "PUT",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ message: string }>(`/notifications/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    ...notificationsQuery,
    notifications: notificationsQuery.data ?? [],
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isMutating:
      markAsReadMutation.isPending ||
      markAllAsReadMutation.isPending ||
      deleteNotificationMutation.isPending,
  };
}
