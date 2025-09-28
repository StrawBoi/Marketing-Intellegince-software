import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FuturisticLandingPage from "./components/FuturisticLandingPage";
import CampaignGenerator from "./components/CampaignGenerator";
import IntegratedMarketingIntelligence from "./components/IntegratedMarketingIntelligence";
import ProfessionalMarketingIntelligence from "./components/ProfessionalMarketingIntelligence";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FuturisticLandingPage />} />
          <Route path="/generator" element={<CampaignGenerator />} />
          <Route path="/intelligence" element={<ProfessionalMarketingIntelligence />} />
          <Route path="/legacy" element={<IntegratedMarketingIntelligence />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;