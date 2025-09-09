import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import OffersSection from "./components/OffersSection";
import CoverageMap from "./components/CoverageMap";
import HowItWorks from "./components/HowItWorks";
import TrustManifest from "./components/TrustManifest";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <OffersSection />
      <CoverageMap />
      <HowItWorks />
      <TrustManifest />
      
      {/* Placeholder sections for remaining components */}
      <div id="reviews" className="h-96 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Reviews section - будет добавлена в следующем файле</p>
      </div>
      
      <div id="faq" className="h-96 bg-white flex items-center justify-center">
        <p className="text-gray-500">FAQ section - будет добавлена в следующем файле</p>
      </div>
      
      <div id="credit" className="h-96 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Credit soft-check - будет добавлена в следующем файле</p>
      </div>
      
      <div id="drop" className="h-96 bg-white flex items-center justify-center">
        <p className="text-gray-500">Drop subscription - будет добавлена в следующем файле</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;