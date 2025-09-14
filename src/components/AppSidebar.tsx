import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  Plus,
  Clock,
  X,
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
    { title: "Leave History & Reports", url: "/history", icon: Clock },
  ];

  const managementItems = [
    { title: "Employees", url: "/employees", icon: Users },
    { title: "Analytics", url: "/reports", icon: BarChart3 },
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
        collapsed ? "w-14" : "w-64"
      } bg-gradient-to-b from-primary to-primary-hover border-r-0 shadow-elevation`}
      collapsible="icon"
    >
      <div className="p-4 relative">
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-gray-800">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="text-black dark:text-white">
              <h2 className="font-bold text-lg">LeaveManager</h2>
              <p className="text-gray-500 text-xs">HR Management</p>
            </div>
          )}
        </div>

        {state === "expanded" && (
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 md:hidden z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-foreground/60 text-xs uppercase tracking-wider px-2">
            {!collapsed && "Main"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-white/10">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        [
                          "flex items-center rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-white text-blue-600 font-medium shadow-sm" // Blue text on white
                            : "text-wrimary-foreground hover:bg-white/10 hover:text-primary", // ✅ FIXED
                        ].join(" ")
                      }
                      onClick={() => {
                        if (isMobile && state === "expanded") {
                          closeSidebar();
                        }
                      }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate text-sm leading-none">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-primary-foreground/60 text-xs uppercase tracking-wider px-2">
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-white/10">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        [
                          "flex items-center rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-white text-blue-600 font-medium shadow-sm" // Blue text on white
                            : "text-white hover:bg-white/10 hover:text-blue-500", // White text on blue background
                        ].join(" ")
                      }
                      onClick={() => {
                        if (isMobile && state === "expanded") {
                          closeSidebar();
                        }
                      }}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate text-sm leading-none">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 mt-auto">
        <SidebarTrigger
          ref={sidebarTriggerRef}
          className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
        />
      </div>
    </Sidebar>
  );
}
