import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { logPageView } from "@/utils/analytics";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Create from "./pages/Create";
import Regions from "./pages/Regions";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Showcase from "./pages/Showcase";
import Testimonials from "./pages/Testimonials";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import PaymentsDashboard from "./pages/admin/PaymentsDashboard";
import UnifiedDashboard from "./pages/admin/UnifiedDashboard";
import InitialSetup from "./pages/admin/InitialSetup";
import ClientDashboard from "./pages/client/Dashboard";
import AdditionalServices from "./pages/AdditionalServices";
import ServiceRequest from "./pages/ServiceRequest";
import RequestDetail from "./pages/RequestDetail";
import NotFound from "./pages/NotFound";
import PublicTracking from "./pages/PublicTracking";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Ebooks from "./pages/Ebooks";
import EbookDownload from "./pages/EbookDownload";
import SetupSuperAdmin from "./pages/admin/SetupSuperAdmin";
import UsersManagement from "./pages/admin/UsersManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/additional" element={<AdditionalServices />} />
          <Route path="/service-request" element={<ServiceRequest />} />
          <Route path="/create" element={<Create />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/setup" element={<SetupSuperAdmin />} />
          <Route path="/admin/initial-setup" element={<InitialSetup />} />
          <Route path="/admin/dashboard" element={<UnifiedDashboard />} />
          <Route path="/admin/old-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/payments" element={<PaymentsDashboard />} />
          <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/request/:id" element={<RequestDetail />} />
          <Route path="/tracking" element={<PublicTracking />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/ebook/:slug" element={<EbookDownload />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
