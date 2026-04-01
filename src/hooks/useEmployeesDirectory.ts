import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ApiEmployeeRecord, ApiListResponse, ApiSystemUser } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import { isHrRole } from "@/lib/roles";

export function useEmployeesDirectory(enabled = true) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["employees-directory"],
    queryFn: async () => {
      const response = await apiFetch<ApiListResponse<ApiSystemUser[]>>(
        "/system_users?role=employee",
      );

      return response.data.map<ApiEmployeeRecord>((employee) => ({
        ...employee,
        employeeName: employee.username,
        pno: employee.staffId,
      }));
    },
    staleTime: 60_000,
    enabled: enabled && isHrRole(user?.role),
  });
}
