import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Overview from './pages/Overview';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Videos from './pages/Videos';
import Social from './pages/Social';
import Payment from './pages/Payment';
import Location from './pages/Location';
import Analytics from './pages/Analytics';
import QRCode from './pages/QRCode';
import BusinessCard from './pages/BusinessCard';
import Home from './pages/Home';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminUsers from './pages/superadmin/SuperAdminUsers';
import SuperAdminUserDetails from './pages/superadmin/SuperAdminUserDetails';
import SuperAdminBusinesses from './pages/superadmin/SuperAdminBusinesses';
import SuperAdminBusinessDetails from './pages/superadmin/SuperAdminBusinessDetails';
import SuperAdminAnalytics from './pages/superadmin/SuperAdminAnalytics';
import SuperAdminModeration from './pages/superadmin/SuperAdminModeration';
import SuperAdminSettings from './pages/superadmin/SuperAdminSettings';
import SuperAdminActivityLogs from './pages/superadmin/SuperAdminActivityLogs';
import SuperAdminSubscriptions from './pages/superadmin/SuperAdminSubscriptions';
import SuperAdminSupport from './pages/superadmin/SuperAdminSupport';
import Support from './pages/Support';
import Subscription from './pages/Subscription';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function SuperAdminRoute({ children }) {
  const savedUser = localStorage.getItem('superadmin_user');
  if (savedUser) {
    const user = JSON.parse(savedUser);
    if (user.role === 'superadmin') return children;
  }
  return <Navigate to="/superadmin/login" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/business/:slug" element={<BusinessCard />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<Products />} />
          <Route path="services" element={<Services />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="videos" element={<Videos />} />
          <Route path="social" element={<Social />} />
          <Route path="payment" element={<Payment />} />
          <Route path="location" element={<Location />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="qrcode" element={<QRCode />} />
          <Route path="support" element={<Support />} />
          <Route path="subscription" element={<Subscription />} />
        </Route>
        <Route path="/" element={<Home />} />

        {/* SuperAdmin Routes */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route
          path="/superadmin"
          element={
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          }
        >
          <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="users" element={<SuperAdminUsers />} />
          <Route path="users/:id" element={<SuperAdminUserDetails />} />
          <Route path="businesses" element={<SuperAdminBusinesses />} />
          <Route path="businesses/:id" element={<SuperAdminBusinessDetails />} />
          <Route path="analytics" element={<SuperAdminAnalytics />} />
          <Route path="moderation" element={<SuperAdminModeration />} />
          <Route path="settings" element={<SuperAdminSettings />} />
          <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
          <Route path="support" element={<SuperAdminSupport />} />
          <Route path="activity-logs" element={<SuperAdminActivityLogs />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
