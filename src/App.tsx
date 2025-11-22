import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Playlists from "./pages/Playlists";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { LogOut, Radio, Music, Calendar, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const tabs = [
    { path: "/", label: "Tableau de Bord", icon: Radio },
    { path: "/playlists", label: "Playlists", icon: Music },
    { path: "/schedule", label: "Programmes", icon: Calendar },
    { path: "/settings", label: "Paramètres", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with horizontal tabs */}
      <header className="glass-effect sticky top-0 z-50 shadow-deep border-b border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-divine">
                <Radio className="h-5 w-5 text-background" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-foreground">Radio Kambove Tabernacle</h1>
                <p className="text-xs text-muted-foreground">Système de Gestion</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.username}</span>
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          {/* Horizontal Tabs Navigation */}
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative",
                    "hover:text-accent hover:bg-accent/5",
                    isActive 
                      ? "text-accent border-b-2 border-accent bg-accent/10" 
                      : "text-muted-foreground border-b-2 border-transparent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 overflow-auto">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
