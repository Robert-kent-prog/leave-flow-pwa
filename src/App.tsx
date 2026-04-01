import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import LeaveCalendarPage from "./pages/NewLeaveSchedule";
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
import { ApiProvider } from "./contexts/ApiProvider";
import { HR_ROLES } from "./lib/roles";

const queryClient = new QueryClient();

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
                  <Route
                    path="employees"
                    element={
                      <ProtectedRoute allowedRoles={HR_ROLES}>
                        <NewEmployees />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="calendar" element={<LeaveCalendarPage />} />
                  <Route
                    path="schedule"
                    element={<Navigate to="/calendar" replace />}
                  />
                  <Route
                    path="leave-schedule"
                    element={<Navigate to="/calendar" replace />}
                  />
                  <Route
                    path="company-planner"
                    element={<Navigate to="/calendar" replace />}
                  />
                  <Route path="request" element={<LeaveRequest />} />
                  <Route path="history" element={<LeaveHistory />} />
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute allowedRoles={HR_ROLES}>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="analytics"
                    element={
                      <ProtectedRoute allowedRoles={HR_ROLES}>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="profile" element={<Profile />} />
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
