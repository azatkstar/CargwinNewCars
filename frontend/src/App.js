import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Header from "./components/Header";
import Hero from "./components/Hero";
import OffersSection from "./components/OffersSection";
import DropSubscription from "./components/DropSubscription";
import CoverageMap from "./components/CoverageMap";
import InstantQuoteTool from "./components/InstantQuoteTool";
import RecentActivity from "./components/RecentActivity";
import HowItWorks from "./components/HowItWorks";
import TrustManifest from "./components/TrustManifest";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import TrustFAQ from "./components/TrustFAQ";
import ProcessSteps from "./components/ProcessSteps";
import CompareVehicles from "./components/CompareVehicles";
import Footer from "./components/Footer";
import FOMOTicker from "./components/FOMOTicker";
import LiveChatWidget from "./components/LiveChatWidget";
import CarDetail from "./pages/CarDetail";
import PreviewLot from "./pages/PreviewLot";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileForm from "./pages/ProfileForm";
import SchedulePickup from "./pages/SchedulePickup";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Disclaimer from "./pages/Disclaimer";
import CCPARights from "./pages/CCPARights";
import AboutUs from "./pages/AboutUs";
import WhatToExpect from "./pages/WhatToExpect";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import { AuthProvider } from "./hooks/useAuth";
import { I18nProvider } from "./hooks/useI18n";
import { FOMOSettingsProvider } from './hooks/useFOMOSettings';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main">
        <Hero />
        <OffersSection />
        
        {/* Instant Quote & Recent Activity in grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InstantQuoteTool />
            </div>
            <div>
              <RecentActivity />
            </div>
          </div>
        </div>
        
        <DropSubscription />
        <CoverageMap />
        <HowItWorks />
        <ProcessSteps />
        <TrustManifest />
        <TrustFAQ />
        <Reviews />
        <FAQ />
      </main>
      <Footer />
      <FOMOTicker />
      <LiveChatWidget />
      
      {/* Add bottom padding to account for FOMO ticker */}
      <div className="h-16 lg:h-12" />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <BrowserRouter>
          <I18nProvider>
            <FOMOSettingsProvider>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/car/:carId" element={<CarDetail />} />
                  <Route path="/cars/:carId" element={<CarDetail />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/profile" element={<ProfileForm />} />
                  <Route path="/dashboard/schedule-pickup/:applicationId" element={<SchedulePickup />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                  <Route path="/ccpa-rights" element={<CCPARights />} />
                  <Route path="/preview/:token" element={<PreviewLot />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={<AdminDashboard />} />
                </Routes>
              </AuthProvider>
            </FOMOSettingsProvider>
          </I18nProvider>
        </BrowserRouter>
      </HelmetProvider>
    </div>
  );
}

export default App;