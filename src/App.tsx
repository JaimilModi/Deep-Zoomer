import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Viewer from "./pages/Viewer";
import NotFound from "./pages/NotFound";
import NasaSearch from "./pages/NasaSearch";
import AIEnhancedViewer from "./components/AIEnhancedViewer";
import AIEnhancedNasaSearch from "./components/AIEnhancedNasaSearch";
import PixelPerfectViewer from "./components/PixelPerfectViewer";
import DziTest from "./pages/DziTest";
import WorkingViewer from "./pages/WorkingViewer";
import SimpleTest from "./pages/SimpleTest";
import HighResViewer from "./components/HighResViewer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="/nasa-search" element={<NasaSearch />} />
          <Route path="/ai-search" element={<AIEnhancedNasaSearch />} />
          <Route path="/ai-viewer" element={<AIEnhancedViewer />} />
          <Route path="/pixel-viewer" element={<PixelPerfectViewer />} />
          <Route path="/dzi-test" element={<DziTest />} />
          <Route path="/working-viewer" element={<WorkingViewer />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/high-res" element={<HighResViewer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
