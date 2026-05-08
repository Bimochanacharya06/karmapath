import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingChatBubble from "@/components/FloatingChatBubble";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Blog from "./pages/Blog";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Marketplace from "./pages/Marketplace";
import AskPandit from "./pages/AskPandit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/ask-pandit" element={<AskPandit />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingChatBubble />
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
