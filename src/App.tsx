import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/design-system/atoms/LoadingSpinner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const LotteryPage = lazy(() => import("./pages/LotteryPage").then(m => ({ default: m.LotteryPage })));
const MyGames = lazy(() => import("./pages/MyGames").then(m => ({ default: m.MyGames })));
const Conference = lazy(() => import("./pages/Conference").then(m => ({ default: m.Conference })));
const Generator = lazy(() => import("./pages/Generator").then(m => ({ default: m.Generator })));
const NotFound = lazy(() => import("./pages/NotFound"));

// QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 segundos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" label="Carregando página..." />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/meus-jogos" element={<MyGames />} />
              <Route path="/conferencia" element={<Conference />} />
              <Route path="/gerador" element={<Generator />} />
              {/* Dynamic Lottery Route */}
              <Route path="/:slug" element={<LotteryPage />} />
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
