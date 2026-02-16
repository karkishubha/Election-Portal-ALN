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
// Replaced Election Integrity with dedicated sections
import AdminViolations from "./pages/admin/AdminViolations";
import AdminMisinformation from "./pages/admin/AdminMisinformation";
import AdminNewsletters from "./pages/admin/AdminNewsletters";
import AdminPoliticalParties from "./pages/admin/AdminPoliticalParties";
import AdminInfographics from "./pages/admin/AdminInfographics";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminExplainers from "./pages/admin/AdminExplainers";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";

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
          <Route path="/admin/violations" element={<ProtectedRoute><AdminViolations /></ProtectedRoute>} />
          <Route path="/admin/misinformation" element={<ProtectedRoute><AdminMisinformation /></ProtectedRoute>} />
          <Route path="/admin/infographics" element={<ProtectedRoute><AdminInfographics /></ProtectedRoute>} />
          <Route path="/admin/videos" element={<ProtectedRoute><AdminVideos /></ProtectedRoute>} />
          <Route path="/admin/explainers" element={<ProtectedRoute><AdminExplainers /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
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
