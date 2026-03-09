import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="fullscreen-loader">Validando sessão...</div>;
  }

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} />} />
    </Routes>
  );
}
