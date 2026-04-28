import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './pages/ChatAssistant';
import Documents from './pages/Documents';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import SessionHistory from './pages/SessionHistory';
import Analytics from './pages/Analytics';
import HelpCenter from './pages/HelpCenter';
import AdminSecurity from './pages/AdminSecurity';
import ComplianceRisk from './pages/ComplianceRisk';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="chat"        element={<ChatAssistant />} />
          <Route path="documents"   element={<Documents />} />
          <Route path="sessions"    element={<SessionHistory />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="users"       element={<Users />} />
          <Route path="audit-logs"  element={<AuditLogs />} />
          <Route path="settings"    element={<Settings />} />
          <Route path="help"        element={<HelpCenter />} />
          <Route path="admin/security" element={<AdminSecurity />} />
          <Route path="compliance"  element={<ComplianceRisk />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
