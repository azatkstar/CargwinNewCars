import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AdminLogin from './AdminLogin';
import AdminLayout from '../../components/admin/AdminLayout';
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
import UploadPDF from './UploadPDF';
import ParsedPrograms from './ParsedPrograms';
import FeaturedDealsAdmin from './FeaturedDealsAdmin';
import CreateDeal from './CreateDeal';
import SyncEngine from './SyncEngine';
import SyncLogs from './SyncLogs';
import Monitoring from './Monitoring';
import AdminAnalytics from './AdminAnalytics';
import AdminNotifications from './AdminNotifications';
import AIGenerator from './AIGenerator';
import AdminMedia from './AdminMedia';
import AdminMultiSync from './AdminMultiSync';
import ScraperControl from './ScraperControl';
import OffersManagement from './OffersManagement';
import OfferEditor from './OfferEditor';

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
        <Route index element={<Navigate to="featured-deals" replace />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="broker-applications" element={<BrokerApplicationsAdmin />} />
        <Route path="finance-manager" element={<FinanceManagerDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="lease-programs" element={<LeasePrograms />} />
        <Route path="finance-programs" element={<FinancePrograms />} />
        <Route path="tax-configs" element={<TaxConfigs />} />
        <Route path="calculator-tools" element={<CalculatorTools />} />
        <Route path="upload-pdf" element={<UploadPDF />} />
        <Route path="parsed-programs" element={<ParsedPrograms />} />
        <Route path="featured-deals" element={<FeaturedDealsAdmin />} />
        <Route path="featured-deals/create" element={<CreateDeal />} />
        <Route path="sync" element={<SyncEngine />} />
        <Route path="sync/logs" element={<SyncLogs />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="advanced-analytics" element={<AdminAnalytics />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="ai-generator" element={<AIGenerator />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="multi-sync" element={<AdminMultiSync />} />
        <Route path="scraper" element={<ScraperControl />} />
        <Route path="offers" element={<OffersManagement />} />
        <Route path="offers/new" element={<OfferEditor />} />
        <Route path="offers/:id/edit" element={<OfferEditor />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;