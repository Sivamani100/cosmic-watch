import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AsteroidDetail from "./pages/AsteroidDetail";
import Watched from "./pages/Watched";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Visualization from "./pages/Visualization";
import APOD from "./pages/APOD";
import SpaceWeather from "./pages/SpaceWeather";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(230 35% 12%)',
            color: 'hsl(210 40% 98%)',
            border: '1px solid hsl(230 25% 22%)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(152 76% 40%)',
              secondary: 'hsl(210 40% 98%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(0 84% 60%)',
              secondary: 'hsl(210 40% 98%)',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard (accessible to all, but some features need auth) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asteroid/:neoId" element={<AsteroidDetail />} />
          <Route path="/visualization" element={<Visualization />} />
          <Route path="/apod" element={<APOD />} />
          <Route path="/space-weather" element={<SpaceWeather />} />
          <Route path="/community" element={<Community />} />

          {/* Protected Routes */}
          <Route path="/watched" element={<Watched />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
