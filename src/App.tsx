import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NewPhoto from './components/NewPhoto';
import Projects from './components/Projects';
import Gallery from './components/Gallery';
import Settings from './components/Settings';
import BlockedScreen from './components/BlockedScreen';
import InstallPrompt from './components/InstallPrompt';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(0,255,102,0.1)',
          border: '1.5px solid rgba(0,255,102,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="10" r="5" stroke="#00ff66" strokeWidth="2" />
            <circle cx="12" cy="10" r="2" fill="#00ff66" />
            <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#00ff66" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  // Block check
  if (profile?.licenseStatus === 'blocked' && location.pathname !== '/bloqueado') {
    return <BlockedScreen />;
  }

  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/nova-foto"
          element={<ProtectedRoute><NewPhoto /></ProtectedRoute>}
        />
        <Route
          path="/projetos"
          element={<ProtectedRoute><Projects /></ProtectedRoute>}
        />
        <Route
          path="/galeria"
          element={<ProtectedRoute><Gallery /></ProtectedRoute>}
        />
        <Route
          path="/configuracoes"
          element={<ProtectedRoute><Settings /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <InstallPrompt />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
