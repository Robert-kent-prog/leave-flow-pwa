import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ApiHoliday } from "@/types/api";

type HolidayFilters = {
  year?: string;
  month?: string;
  enabled?: boolean;
};

const buildQuery = ({ year, month }: HolidayFilters) => {
  const params = new URLSearchParams();

  if (year && year !== "all") {
    params.set("year", year);
  }

  if (month && month !== "all") {
    params.set("month", month);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export function useCompanyHolidays(filters: HolidayFilters = {}) {
  const endpoint = `/holidays${buildQuery(filters)}`;

  return useQuery({
    queryKey: ["company-holidays", filters.year ?? "all", filters.month ?? "all"],
    queryFn: () => apiFetch<ApiHoliday[]>(endpoint),
    staleTime: 60_000,
    enabled: filters.enabled ?? true,
  });
}
