import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from '../../components/admin/AdminLayout';
import LotsList from '../../components/admin/LotsList';
import LotForm from '../../components/admin/LotForm';
import AdminUsers from './AdminUsers';
import AdminApplications from './AdminApplications';
import FinanceManagerDashboard from './FinanceManagerDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import BrokerApplicationsAdmin from './BrokerApplicationsAdmin';
import AdminSettings from './AdminSettings';
import AuditLog from './AuditLog';
import LeasePrograms from './LeasePrograms';
import FinancePrograms from './FinancePrograms';
import TaxConfigs from './TaxConfigs';
import CalculatorTools from './CalculatorTools';

const AdminDashboard = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="lots" replace />} />
        <Route path="lots" element={<LotsList />} />
        <Route path="lots/new" element={<LotForm />} />
        <Route path="lots/:id/edit" element={<LotForm />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="broker-applications" element={<BrokerApplicationsAdmin />} />
        <Route path="finance-manager" element={<FinanceManagerDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="audit" element={<AuditLog />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;