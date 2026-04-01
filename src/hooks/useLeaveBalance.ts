import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ApiLeaveBalanceSummary } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { isHrRole } from "@/lib/roles";

export function useLeaveBalance(staffId?: string, enabled = true) {
  const { user } = useAuth();
  const canQuerySpecificStaffId = Boolean(staffId && isHrRole(user?.role));
  const endpoint = canQuerySpecificStaffId
    ? `/leaves/balance/${staffId}`
    : "/leaves/my-balance";

  return useQuery({
    queryKey: ["leave-balance", canQuerySpecificStaffId ? staffId : "mine"],
    queryFn: () => apiFetch<ApiLeaveBalanceSummary>(endpoint),
    staleTime: 60_000,
    enabled: enabled && Boolean(user) && (canQuerySpecificStaffId || !staffId),
  });
}
