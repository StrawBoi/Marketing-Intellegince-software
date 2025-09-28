import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import CampaignGenerator from "./components/CampaignGenerator";
import MarketingIntelligence from "./components/MarketingIntelligence";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generator" element={<CampaignGenerator />} />
          <Route path="/intelligence" element={<MarketingIntelligence />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;