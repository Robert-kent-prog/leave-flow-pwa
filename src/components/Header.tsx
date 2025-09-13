import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; // ✅ Import SidebarTrigger
import { useState, useEffect } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const unreadCount = 5;

  // ✅ NEW: Get sidebar state
  const { state } = useSidebar(); // <-- This gives you "expanded" or "collapsed"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ NO MORE toggleSidebar or setOpen — we don't control state manually!

  // ❌ DELETE: const { open, setOpen } = useSidebar();
  // ❌ DELETE: const toggleSidebar = () => { setOpen(!open); };

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-card shadow-sm transition-all duration-300 ${
        isScrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          {/* ✅ MOBILE SIDEBAR TOGGLE - FIXED */}
          {/* ✅ CORRECT: Wrap Button inside SidebarTrigger */}
          <SidebarTrigger className="md:hidden h-8 w-8 sm:h-9 sm:w-9 p-0">
            <Button variant="ghost" size="icon" className="h-full w-full p-0">
              {state === "expanded" ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </SidebarTrigger>

          {/* Logo/Title */}
          <h1 className="text-lg font-semibold text-foreground sm:text-xl md:text-2xl whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">
            Employee Leave Management
          </h1>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Mobile search button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
            className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Search bar - hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search employees, requests..."
              className="pl-10 w-40 lg:w-56 xl:w-64"
            />
          </div>

          {/* Mobile search overlay */}
          {isMobileSearchVisible && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in">
              <div className="flex items-center justify-center p-4 mt-20">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search employees, requests..."
                    className="pl-10 w-full"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSearchVisible(false)}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
            ) : (
              <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
            )}
          </Button>

          {/* Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
            asChild
          >
            <Link to="/notifications">
              <Bell className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full sm:top-1 sm:right-1 sm:h-2.5 sm:w-2.5">
                  <span className="sr-only">
                    {unreadCount} unread notifications
                  </span>
                </span>
              )}
            </Link>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full p-0"
              >
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || "No email"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex items-center w-full cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className="flex items-center w-full cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
