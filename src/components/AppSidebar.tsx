import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  Plus,
  ClipboardList,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRef } from "react";
import { useMobile } from "@/hooks/useMobile";

export function AppSidebar() {
  const mainItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "New Leave Request", url: "/request", icon: Plus },
    { title: "Leave History ", url: "/history", icon: Clock },
  ];

  const managementItems = [
    { title: "Employees", url: "/employees", icon: Users },
    { title: "Reports", url: "/reports", icon: ClipboardList },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Company Leaves", url: "/company-planner", icon: Calendar },
    // { title: "Leave Schedule", url: "/schedule", icon: Calendar },
    // { title: "Employees", url: "/newemployees", icon: Calendar },
    // { title: "New Leave schedule", url: "/leave-schedule", icon: Calendar },
  ];

  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const isMobile = useMobile();
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);

  const closeSidebar = () => {
    if (sidebarTriggerRef.current) {
      sidebarTriggerRef.current.click();
    }
  };

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-blue-600  border-r shadow-xl transition-all duration-300`}
      collapsible="icon"
    >
      {/* Header Section */}
      <div className="p-4 relative border-b">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
            <FileText className="w-5 h-5  text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col text-black dark:text-white">
              <h2 className="font-bold text-lg">LeaveManager</h2>
              <p className="text-gray-500  text-xs">HR Portal</p>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {state === "expanded" && isMobile && (
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-black dark:text-white hover:bg-white/20 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <SidebarContent className="px-3 py-4">
        {/* Main Navigation Group */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-gray-500 dark:text-white text-xs uppercase tracking-wider font-semibold px-2 mb-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group hover:bg-blue-700/50 transition-all duration-200"
                  >
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        [
                          "flex items-center rounded-xl px-3 py-3 transition-all duration-200 group-hover:translate-x-1",
                          isActive
                            ? "bg-primary shadow-lg border-l-4 border-primary text-primary font-semibold"
                            : "text-primary hover:text-white hover:bg-primary",
                        ].join(" ")
                      }
                      onClick={() => {
                        if (isMobile && state === "expanded") {
                          closeSidebar();
                        }
                      }}
                    >
                      <item.icon
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                          collapsed ? "" : "mr-3"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                      )}
                      {!collapsed && (
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Group */}
        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="text-gray-500 dark:text-white text-xs uppercase tracking-wider font-semibold px-2 mb-2">
              Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group hover:bg-blue-700/50 transition-all duration-200"
                  >
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        [
                          "flex items-center rounded-xl px-3 py-3 transition-all duration-200 group-hover:translate-x-1",
                          isActive
                            ? "bg-white shadow-lg border-l-4 border-primary text-primary font-semibold"
                            : "text-primary hover:text-white hover:bg-primary-700/30",
                        ].join(" ")
                      }
                      onClick={() => {
                        if (isMobile && state === "expanded") {
                          closeSidebar();
                        }
                      }}
                    >
                      <item.icon
                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                          collapsed ? "" : "mr-3"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                      )}
                      {!collapsed && (
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ChevronRight className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Group */}
        <SidebarGroup className="mt-auto pt-6 border-t">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="group hover:bg-blue-700/50 transition-all duration-200"
                >
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      [
                        "flex items-center rounded-xl px-3 py-3 transition-all duration-200 group-hover:translate-x-1",
                        isActive
                          ? "bg-white shadow-lg border-l-4 border-primary text-primary font-semibold"
                          : "text-primary hover:text-white hover:bg-primary-700/30",
                      ].join(" ")
                    }
                    onClick={() => {
                      if (isMobile && state === "expanded") {
                        closeSidebar();
                      }
                    }}
                  >
                    <Settings
                      className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                        collapsed ? "" : "mr-3"
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate text-sm font-medium">
                        Settings
                      </span>
                    )}
                    {!collapsed && (
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Collapse Trigger */}
      <div className="p-4 border-t">
        <SidebarTrigger
          ref={sidebarTriggerRef}
          className="w-full bg-primary hover:bg-blue-300/70 text-white dark:text-gray-500 border-blue-600 transition-all duration-200 rounded-xl py-3 group hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">Collapse</span>
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </div>
          )}
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
}
