import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import Landing from "@/pages/Landing";
import Onboarding from "@/components/Onboarding";
import AppBar from "@/components/AppBar";
import BottomNav from "@/components/BottomNav";
import FeedPage from "@/pages/Feed";
import EventsPage from "@/pages/Events";
import CandidatesPage from "@/pages/Candidates";
import DocumentsPage from "@/pages/Documents";
import PersonalPage from "@/pages/Personal";
import NotFound from "@/pages/NotFound";
import { useUserLocation } from "@/hooks/use-user-location";

const queryClient = new QueryClient();

type AppScreen = "landing" | "onboarding" | "app";

function AppContent() {
  const { hasCompletedOnboarding } = useUserLocation();
  const { forceLight, restoreTheme } = useTheme();
  const [screen, setScreen] = useState<AppScreen>(hasCompletedOnboarding ? "app" : "landing");

  useEffect(() => {
    if (screen === "landing" || screen === "onboarding") {
      forceLight();
    } else {
      restoreTheme();
    }
  }, [screen, forceLight, restoreTheme]);

  const handleSignOut = () => {
    localStorage.removeItem("politiu_user_location");
    setScreen("landing");
  };

  if (screen === "landing") {
    return <Landing onGetStarted={() => setScreen("onboarding")} onRestore={() => setScreen("app")} />;
  }

  if (screen === "onboarding") {
    return (
      <Onboarding
        onComplete={() => setScreen("app")}
        onBack={() => setScreen("landing")}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-background relative">
      <AppBar />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/personal" element={<PersonalPage onSignOut={handleSignOut} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
