import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Authentication Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Call Generator Pages
import CallGeneratorPage from './pages/callGenerator/CallGeneratorPage';
import SourceDataPage from './pages/callGenerator/SourceDataPage';
import StatisticalParamsPage from './pages/callGenerator/StatisticalParamsPage';
import AutopilotPage from './pages/callGenerator/AutopilotPage';

// Call Monitoring Pages
import MonitoringPage from './pages/monitoring/MonitoringPage';
import CallHistoryPage from './pages/monitoring/CallHistoryPage';
import ReportsPage from './pages/monitoring/ReportsPage';

// Dynamic Routing Pages
import DidManagementPage from './pages/routing/DidManagementPage';
import RoutingConfigPage from './pages/routing/RoutingConfigPage';
import CdrViewPage from './pages/routing/CdrViewPage';

// Settings Pages
import SettingsPage from './pages/settings/SettingsPage';
import ProfilePage from './pages/settings/ProfilePage';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationProvider';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token validity with backend
          // const response = await api.verifyToken(token);
          // setIsAuthenticated(response.isValid);
          setIsAuthenticated(true); // Temporary for development
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
                
                {/* Call Generator Routes */}
                <Route path="/call-generator" element={isAuthenticated ? <CallGeneratorPage /> : <Navigate to="/login" />} />
                <Route path="/source-data" element={isAuthenticated ? <SourceDataPage /> : <Navigate to="/login" />} />
                <Route path="/statistical-params" element={isAuthenticated ? <StatisticalParamsPage /> : <Navigate to="/login" />} />
                <Route path="/autopilot" element={isAuthenticated ? <AutopilotPage /> : <Navigate to="/login" />} />
                
                {/* Call Monitoring Routes */}
                <Route path="/monitoring" element={isAuthenticated ? <MonitoringPage /> : <Navigate to="/login" />} />
                <Route path="/call-history" element={isAuthenticated ? <CallHistoryPage /> : <Navigate to="/login" />} />
                <Route path="/reports" element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />} />
                
                {/* Dynamic Routing Routes */}
                <Route path="/did-management" element={isAuthenticated ? <DidManagementPage /> : <Navigate to="/login" />} />
                <Route path="/routing-config" element={isAuthenticated ? <RoutingConfigPage /> : <Navigate to="/login" />} />
                <Route path="/cdr-view" element={isAuthenticated ? <CdrViewPage /> : <Navigate to="/login" />} />
                
                {/* Settings Routes */}
                <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
              </Route>

              {/* Default Route */}
              <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
