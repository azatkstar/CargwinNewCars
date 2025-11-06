import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Header from "./components/Header";
import Hero from "./components/Hero";
import OffersSection from "./components/OffersSection";
import DropSubscription from "./components/DropSubscription";
import CoverageMap from "./components/CoverageMap";
import HowItWorks from "./components/HowItWorks";
import TrustManifest from "./components/TrustManifest";
import Reviews from "./components/Reviews";
import FAQ from "./components/FAQ";
import CreditSoftCheck from "./components/CreditSoftCheck";
import Footer from "./components/Footer";
import FOMOTicker from "./components/FOMOTicker";
import CarDetail from "./pages/CarDetail";
import PreviewLot from "./pages/PreviewLot";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileForm from "./pages/ProfileForm";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import { AuthProvider } from "./hooks/useAuth";
import { I18nProvider } from "./hooks/useI18n";
import { FOMOSettingsProvider } from './hooks/useFOMOSettings';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <OffersSection />
      <DropSubscription />
      <CoverageMap />
      <HowItWorks />
      <TrustManifest />
      <Reviews />
      <FAQ />
      <CreditSoftCheck />
      <Footer />
      <FOMOTicker />
      
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