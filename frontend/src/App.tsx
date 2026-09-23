import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewKit from './pages/NewKit';
import KitViewer from './pages/KitViewer';
import MockInterviewer from './pages/MockInterviewer';
import PracticeMode from './pages/PracticeMode';
import { Toaster } from 'sonner';

const App = () => {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kits/new" element={<NewKit />} />
        <Route path="/kits/:id" element={<KitViewer />} />
        <Route path="/kits/:id/mock-interview" element={<MockInterviewer />} />
        <Route path="/kits/:id/practice" element={<PracticeMode />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
};

export default App;

