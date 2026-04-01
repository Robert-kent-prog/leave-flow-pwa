import type { SystemRole } from "@/types/api";

export const HR_ROLES: SystemRole[] = ["admin", "hr", "assistant_hr"];

export const isHrRole = (
  role?: SystemRole | null,
): role is Exclude<SystemRole, "employee"> =>
  Boolean(role && HR_ROLES.includes(role));

export const isEmployeeRole = (role?: SystemRole | null): role is "employee" =>
  role === "employee";
