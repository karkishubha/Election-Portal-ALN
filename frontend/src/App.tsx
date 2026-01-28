import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import Election2026 from "./pages/Election2026";
import VoterEducation from "./pages/VoterEducation";
import ElectionIntegrity from "./pages/ElectionIntegrity";
import ElectionMonitoring from "./pages/ElectionMonitoring";
import PoliticalParties from "./pages/PoliticalParties";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVoterEducation from "./pages/admin/AdminVoterEducation";
import AdminElectionIntegrity from "./pages/admin/AdminElectionIntegrity";
import AdminNewsletters from "./pages/admin/AdminNewsletters";
import AdminPoliticalParties from "./pages/admin/AdminPoliticalParties";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/election-2026" element={<Election2026 />} />
          <Route path="/voter-education" element={<VoterEducation />} />
          <Route path="/election-integrity" element={<ElectionIntegrity />} />
          <Route path="/election-monitoring" element={<ElectionMonitoring />} />
          <Route path="/political-parties" element={<PoliticalParties />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/voter-education" element={<ProtectedRoute><AdminVoterEducation /></ProtectedRoute>} />
          <Route path="/admin/election-integrity" element={<ProtectedRoute><AdminElectionIntegrity /></ProtectedRoute>} />
          <Route path="/admin/newsletters" element={<ProtectedRoute><AdminNewsletters /></ProtectedRoute>} />
          <Route path="/admin/political-parties" element={<ProtectedRoute><AdminPoliticalParties /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
