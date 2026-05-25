import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { FeedbackProvider } from './context/FeedbackContext';
import Layout from './components/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import LawyerDashboard from './pages/admin/LawyerDashboard';
import AssistantDashboard from './pages/admin/AssistantDashboard';
import UsersManagement from './pages/admin/Users';
import ProfessionalsPage from './pages/admin/Professionals';
import RolesPage from './pages/admin/Roles';
import ClientsPage from './pages/admin/Clients';
import ServicesPage from './pages/admin/Services';
import ContractModelsPage from './pages/admin/ContractModels';
import ContractsPage from './pages/admin/Contracts';
import ClientDetailPage from './pages/admin/ClientDetail';
import CasesPage from './pages/admin/Cases';
import FinancePage from './pages/admin/Finance';
import AgendaPage from './pages/admin/Agenda';

import ReportsPage from './pages/admin/Reports';
import ProfilePage from './pages/admin/Profile';
import LoginPage from './pages/Login';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DashboardSelector = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'lawyer') return <LawyerDashboard />;
  if (user?.role === 'assistant') return <AssistantDashboard />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <FeedbackProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/admin" replace />} />
              
              <Route path="/admin" element={<ProtectedRoute><Layout children={<DashboardSelector />} /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><Layout children={<UsersManagement />} /></ProtectedRoute>} />
              <Route path="/admin/professionals" element={<ProtectedRoute><Layout children={<ProfessionalsPage />} /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute><Layout children={<RolesPage />} /></ProtectedRoute>} />
              <Route path="/admin/clients" element={<ProtectedRoute><Layout children={<ClientsPage />} /></ProtectedRoute>} />
              <Route path="/admin/clients/:id" element={<ProtectedRoute><Layout children={<ClientDetailPage />} /></ProtectedRoute>} />
              <Route path="/admin/services" element={<ProtectedRoute><Layout children={<ServicesPage />} /></ProtectedRoute>} />
              <Route path="/admin/models" element={<ProtectedRoute><Layout children={<ContractModelsPage />} /></ProtectedRoute>} />
              <Route path="/admin/contracts" element={<ProtectedRoute><Layout children={<ContractsPage />} /></ProtectedRoute>} />
              <Route path="/admin/cases" element={<ProtectedRoute><Layout children={<CasesPage />} /></ProtectedRoute>} />
              <Route path="/admin/agenda" element={<ProtectedRoute><Layout children={<AgendaPage />} /></ProtectedRoute>} />
              <Route path="/admin/finance" element={<ProtectedRoute><Layout children={<FinancePage />} /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><Layout children={<ReportsPage />} /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute><Layout children={<ProfilePage />} /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </FeedbackProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
