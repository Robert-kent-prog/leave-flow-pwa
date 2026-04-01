import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ApiListResponse, ApiSystemUser, SystemRole } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { isHrRole } from "@/lib/roles";

export function useSystemUsers(role?: SystemRole, enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["system-users", role ?? "all"],
    queryFn: async () => {
      const query = role ? `?role=${role}` : "";
      const response = await apiFetch<ApiListResponse<ApiSystemUser[]>>(
        `/system_users${query}`,
      );

      return response.data;
    },
    staleTime: 60_000,
    enabled: enabled && isHrRole(user?.role),
  });
}
