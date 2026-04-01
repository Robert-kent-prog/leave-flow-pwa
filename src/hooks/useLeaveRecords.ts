import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ApiLeaveRecord } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { isEmployeeRole } from "@/lib/roles";

interface LeaveRecordFilters {
  status?: string;
  leaveType?: string;
  pno?: string;
  dutyStation?: string;
  employeeName?: string;
}

interface LeaveRecordQueryOptions {
  scope?: "auto" | "all" | "mine";
  enabled?: boolean;
}

const buildQuery = (filters?: LeaveRecordFilters) => {
  const params = new URLSearchParams();

  if (!filters) {
    return "";
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};

export function useLeaveRecords(
  filters?: LeaveRecordFilters,
  options: LeaveRecordQueryOptions = {},
) {
  const { user } = useAuth();
  const resolvedScope =
    options.scope === "all" || options.scope === "mine"
      ? options.scope
      : isEmployeeRole(user?.role)
        ? "mine"
        : "all";
  const endpoint =
    resolvedScope === "mine"
      ? `/leaves/mine${buildQuery(filters)}`
      : `/leaves${buildQuery(filters)}`;

  return useQuery({
    queryKey: ["leave-records", resolvedScope, filters ?? {}],
    queryFn: () => apiFetch<ApiLeaveRecord[]>(endpoint),
    staleTime: 60_000,
    enabled: (options.enabled ?? true) && Boolean(user),
  });
}
