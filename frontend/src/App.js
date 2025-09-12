import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/car/:carId" element={<CarDetail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;