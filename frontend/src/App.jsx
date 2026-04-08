import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useApp }  from './context/AppContext';
import { useEffect } from 'react';
import LoginPage    from './pages/LoginPage';
import Layout       from './components/common/Layout';
import Dashboard    from './pages/DashboardPage';
import Timetable    from './pages/TimetablePage';
import RoomsPage    from './pages/RoomsPage';
import TeachersPage from './pages/TeachersPage';
import ConflictsPage from './pages/ConflictsPage';
import ReportsPage  from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage    from './pages/UsersPage';

function ProtectedRoute({ children, require: reqPerm }) {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (reqPerm && !can(reqPerm)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  const { fetchAll } = useApp();

  useEffect(() => { if (user) fetchAll(); }, [user]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index                element={<ProtectedRoute require="admin"><Dashboard /></ProtectedRoute>} />
        <Route path="timetable"     element={<Timetable />} />
        <Route path="rooms"         element={<RoomsPage />} />
        <Route path="teachers"      element={<TeachersPage />} />
        <Route path="conflicts"     element={<ConflictsPage />} />
        <Route path="reports"       element={<ReportsPage />} />
        <Route path="settings"      element={<ProtectedRoute require="settings"><SettingsPage /></ProtectedRoute>} />
        <Route path="users"         element={<ProtectedRoute require="settings"><UsersPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
