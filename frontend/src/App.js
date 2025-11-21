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
import CargwinGPT from "./components/CargwinGPT";
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
import EarlyAccess from "./pages/EarlyAccess";
import OffersPage from "./pages/OffersPage";
import ServicesPage from "./pages/ServicesPage";
import CoveragePage from "./pages/CoveragePage";
import ContactPage from "./pages/ContactPage";
import ReviewsPage from "./pages/ReviewsPage";
import BrokerApplication from "./pages/BrokerApplication";
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
        {/* Main content on separate /offers page */}
        <HowItWorks />
        <TrustFAQ />
        <Reviews />
        <FAQ />
      </main>
      <Footer />
      <CargwinGPT />
      
      {/* Add bottom padding */}
      <div className="h-16" />
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
                  <Route path="/offers" element={<OffersPage />} />
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
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/what-to-expect" element={<WhatToExpect />} />
                  <Route path="/early-access" element={<EarlyAccess />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/coverage" element={<CoveragePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/broker-application" element={<BrokerApplication />} />
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