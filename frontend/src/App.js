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
import FeaturedDealsSection from "./components/FeaturedDealsSection";
import WhyHunterLease from "./components/WhyHunterLease";
import FinalCTA from "./components/FinalCTA";
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
import HowItWorksPage from "./pages/HowItWorks";
import Coverage from "./pages/Coverage";
import EarlyAccess from "./pages/EarlyAccess";
import OffersPage from "./pages/OffersPage";
import ServicesPage from "./pages/ServicesPage";
import CoveragePage from "./pages/CoveragePage";
import ContactPage from "./pages/ContactPage";
import ReviewsPage from "./pages/ReviewsPage";
import LeaseCalculator from "./pages/LeaseCalculator";
import Deals from "./pages/Deals";
import DealPage from "./pages/DealPage";
import Compare from "./pages/Compare";
import BrokerApplication from "./pages/BrokerApplication";
import MyFavorites from "./pages/MyFavorites";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import LeasePrograms from "./pages/admin/LeasePrograms";
import FinancePrograms from "./pages/admin/FinancePrograms";
import TaxConfigs from "./pages/admin/TaxConfigs";
import CalculatorTools from "./pages/admin/CalculatorTools";
import { AuthProvider } from "./hooks/useAuth";
import { I18nProvider } from "./hooks/useI18n";
import { FOMOSettingsProvider } from './hooks/useFOMOSettings';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main">
        <Hero />
        <FeaturedDealsSection />
        <HowItWorks />
        <WhyHunterLease />
        <TrustFAQ />
        <Reviews />
        <FAQ />
        <FinalCTA />
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
                  <Route path="/deals-old" element={<Deals />} />
                  <Route path="/deals" element={<OffersPage />} />
                  <Route path="/calculator" element={<LeaseCalculator />} />
                  <Route path="/deal/:id" element={<DealPage />} />
                  <Route path="/compare" element={<Compare />} />
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
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/early-access" element={<EarlyAccess />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/coverage" element={<Coverage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/my-favorites" element={<MyFavorites />} />
                  <Route path="/broker-application" element={<BrokerApplication />} />
                  <Route path="/preview/:token" element={<PreviewLot />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/lease-programs" element={<LeasePrograms />} />
                  <Route path="/admin/finance-programs" element={<FinancePrograms />} />
                  <Route path="/admin/tax-configs" element={<TaxConfigs />} />
                  <Route path="/admin/calculator-tools" element={<CalculatorTools />} />
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