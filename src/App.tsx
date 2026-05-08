import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "@/src/components/layout/Sidebar";
import Dashboard from "@/src/pages/Dashboard";
import Landing from "@/src/pages/Landing";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/src/store/authStore";

import Analytics from "@/src/pages/Analytics";
import Family from "@/src/pages/Family";
import Records from "@/src/pages/Records";
import Summaries from "@/src/pages/Summaries";
import Medicines from "@/src/pages/Medicines";
import Appointments from "@/src/pages/Appointments";
import Settings from "@/src/pages/Settings";
import UploadPage from "@/src/pages/Upload";

function AppContent() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans antialiased text-[#1E293B]">
      <Sidebar aria-label="Main Navigation" />
      <main className="flex-1 overflow-hidden" id="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/records" element={<Records />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/tracker" element={<Analytics />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/family" element={<Family />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
