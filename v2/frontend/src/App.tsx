import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Directory from './pages/directory/Directory';
import Settings from './pages/settings/Settings';
import PlaceholderPage from './pages/placeholder/PlaceholderPage';
import LeaveManagement from './pages/leave/LeaveManagement';
import Attendance from './pages/attendance/Attendance';
import Payroll from './pages/payroll/Payroll';
import Reports from './pages/reports/Reports';
import { useAuthStore } from './store/useAuthStore';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside AppLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="employees" element={<Directory />} />
            <Route path="locations" element={<PlaceholderPage title="Locations" />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="bank-transfer" element={<PlaceholderPage title="Bank Transfer" />} />
            <Route path="statutory" element={<PlaceholderPage title="Statutory Compliance" />} />
            <Route path="wages" element={<PlaceholderPage title="Wages" />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />

            {/* Employee Specific Routes */}
            <Route path="payslips" element={<PlaceholderPage title="My Payslips" />} />
            <Route path="my-leaves" element={<PlaceholderPage title="My Leaves" />} />
            <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
