import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import LeaveSchedule from "./pages/LeaveSchedule";
import NotFound from "./pages/NotFound";
import NewLeaveShedule from "./pages/NewLeaveSchedule";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveHistory from "./pages/LeaveHistory";
import NewEmployees from "./pages/NewEmployees";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotificationPage from "./pages/Notifications";
import PasswordReset from "./pages/PasswordReset";
import { LeavePlanner } from "./components/LeavePlanner/LeavePlanner";
import { CompanyLeavePlanner } from "./components/CompanyLeavePlanner/CompanyLeavePlanner";
import { Permission } from "./types/leave";
import { ApiProvider } from "./contexts/ApiProvider";

const queryClient = new QueryClient();

// Temporary permissions for development - allow everything
const tempPermissions: Permission = {
  viewLeaves: true,
  manageLeaves: true,
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ApiProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<PasswordReset />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="employees" element={<NewEmployees />} />
                  <Route path="schedule" element={<LeaveSchedule />} />
                  <Route path="calendar" element={<LeavePlanner />} />
                  <Route
                    path="company-planner"
                    element={
                      <CompanyLeavePlanner permissions={tempPermissions} />
                    }
                  />
                  <Route path="request" element={<LeaveRequest />} />
                  <Route path="history" element={<LeaveHistory />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="leave-schedule" element={<NewLeaveShedule />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="notifications" element={<NotificationPage />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ApiProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
export default App;
