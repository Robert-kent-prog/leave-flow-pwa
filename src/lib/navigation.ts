import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Home,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import type { SystemRole } from "@/types/api";
import { isHrRole } from "@/lib/roles";

const sharedNavigation = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: Home, end: true },
      { title: "Notifications", url: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Leave Operations",
    items: [
      { title: "New Request", url: "/request", icon: Plus },
      { title: "Leave History", url: "/history", icon: ClipboardList },
      { title: "Leave Calendar", url: "/calendar", icon: CalendarDays },
    ],
  },
];

const administrationNavigation = {
  label: "Administration",
  items: [
    { title: "Employees", url: "/employees", icon: Users },
    { title: "Reports", url: "/reports", icon: ClipboardList },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
  ],
};

export const getAppNavigation = (role?: SystemRole) =>
  isHrRole(role)
    ? [...sharedNavigation, administrationNavigation]
    : sharedNavigation;

const pageMeta = [
  {
    path: "/",
    title: "Dashboard",
    description: "Monitor leave activity, staffing coverage, and current workload.",
    eyebrow: "Workspace",
  },
  {
    path: "/request",
    title: "New Leave Request",
    description: "Create and submit a leave request with complete employee details.",
    eyebrow: "Leave Operations",
  },
  {
    path: "/history",
    title: "Leave History",
    description: "Review requests, approvals, and changes across the organization.",
    eyebrow: "Leave Operations",
  },
  {
    path: "/calendar",
    title: "Leave Calendar",
    description: "Track upcoming leave across dates, employees, and leave types.",
    eyebrow: "Leave Operations",
  },
  {
    path: "/employees",
    title: "Employees",
    description: "Browse employees and understand current leave coverage at a glance.",
    eyebrow: "Administration",
  },
  {
    path: "/reports",
    title: "Reports",
    description: "Filter, review, and export leave records for operational reporting.",
    eyebrow: "Administration",
  },
  {
    path: "/analytics",
    title: "Analytics",
    description: "Explore trends, approval rates, and leave distribution using live data.",
    eyebrow: "Administration",
  },
  {
    path: "/settings",
    title: "Settings",
    description: "Adjust your workspace preferences and notification behavior.",
    eyebrow: "Preferences",
  },
  {
    path: "/profile",
    title: "Profile",
    description: "Manage your account details and security settings.",
    eyebrow: "Account",
  },
  {
    path: "/notifications",
    title: "Notifications",
    description: "Stay current on approvals, reminders, and system events.",
    eyebrow: "Workspace",
  },
];

export const settingsNavItem = {
  title: "Settings",
  url: "/settings",
  icon: Settings,
};

export const resolvePageMeta = (pathname: string) => {
  const exactMatch = pageMeta.find((meta) => meta.path === pathname);
  if (exactMatch) {
    return exactMatch;
  }

  const partialMatch = [...pageMeta]
    .sort((a, b) => b.path.length - a.path.length)
    .find((meta) => pathname.startsWith(meta.path) && meta.path !== "/");

  return (
    partialMatch || {
      title: "LeaveFlow",
      description: "Professional leave planning and employee leave operations.",
      eyebrow: "Workspace",
    }
  );
};
