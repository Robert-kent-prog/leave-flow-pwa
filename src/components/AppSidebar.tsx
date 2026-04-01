import { NavLink } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { type ComponentType, useRef } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAppNavigation, settingsNavItem } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
  const appNavigation = getAppNavigation(user?.role);

  const closeSidebar = () => {
    if (sidebarTriggerRef.current) {
      sidebarTriggerRef.current.click();
    }
  };

  const renderNavItem = ({
    title,
    url,
    icon: Icon,
    end,
  }: {
    title: string;
    url: string;
    icon: ComponentType<{ className?: string }>;
    end?: boolean;
  }) => (
    <SidebarMenuItem key={title}>
      <NavLink
        to={url}
        end={end}
        className={({ isActive }) =>
          [
            "group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
            isActive
              ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-white",
          ].join(" ")
        }
        onClick={() => {
          if (isMobile && state === "expanded") {
            closeSidebar();
          }
        }}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? "" : "mr-3"}`} />
        {!collapsed && <span className="truncate">{title}</span>}
        {!collapsed && (
          <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </NavLink>
    </SidebarMenuItem>
  );

  return (
    <Sidebar
      className={`${
        collapsed ? "w-[78px]" : "w-64"
      } border-r border-slate-200 bg-white text-slate-900 transition-[width] duration-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100`}
      collapsible="icon"
    >
      <div className="relative border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div
          className={`flex items-center gap-3 transition-all duration-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-950">
            <CalendarDays className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                LeaveFlow
              </p>
              <h2 className="truncate text-base font-semibold text-slate-950 dark:text-slate-50">
                HR Workspace
              </h2>
            </div>
          )}
        </div>

        {state === "expanded" && isMobile && (
          <button
            onClick={closeSidebar}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <SidebarContent className="px-3 py-4">
        {appNavigation.map((section, index) => (
          <SidebarGroup
            key={section.label}
            className={index === 0 ? "" : "mt-4"}
          >
            {!collapsed && (
              <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>{section.items.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Preferences
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{renderNavItem(settingsNavItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <SidebarTrigger
          ref={sidebarTriggerRef}
          className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex w-full items-center justify-between text-sm font-medium">
              <span>Collapse</span>
              <ChevronLeft className="h-4 w-4" />
            </div>
          )}
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
}
