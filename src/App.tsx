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
import LeaveRequest from "./pages/LeaveRequest";
import LeaveHistory from "./pages/LeaveHistory";
import NewEmployees from "./pages/NewEmployees";
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
// import { Permission } from "./types/leave";

const queryClient = new QueryClient();
// // eslint-disable-next-line react-hooks/rules-of-hooks
// const [permissions] = useState<Permission>({
//   viewLeaves: true,
//   manageLeaves: true, // Set based on user role
// });

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Move AuthProvider inside BrowserRouter */}
          <AuthProvider>
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
                <Route path="calender" element={<LeavePlanner />} />
                <Route path="request" element={<LeaveRequest />} />
                <Route
                  path="companyplanner"
                  element={<CompanyLeavePlanner permissions={undefined} />}
                />
                <Route path="history" element={<LeaveHistory />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<NotificationPage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
