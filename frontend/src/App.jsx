import { Routes, Route, Navigate } from 'react-router-dom';
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
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
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
